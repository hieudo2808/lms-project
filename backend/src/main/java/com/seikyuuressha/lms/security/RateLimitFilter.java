ackage com.seikyuuressha.lms.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    private Bucket createGraphQLBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.classic(60, Refill.greedy(60, Duration.ofMinutes(1))))
                .build();
    }

    private Bucket createGeneralBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.classic(200, Refill.greedy(200, Duration.ofMinutes(1))))
                .build();
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String clientIp = getClientIP(request);
        String path = request.getRequestURI();

        boolean isGraphQL = path.contains("/graphql");

        String bucketKey = clientIp + (isGraphQL ? ":graphql" : ":general");
        Bucket bucket = buckets.computeIfAbsent(bucketKey, 
            k -> isGraphQL ? createGraphQLBucket() : createGeneralBucket());

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            log.warn("Rate limit exceeded for IP: {} on path: {}", clientIp, path);
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"errors\":[{\"message\":\"Too many requests. Please try again later.\"}]}");
        }
    }

    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
