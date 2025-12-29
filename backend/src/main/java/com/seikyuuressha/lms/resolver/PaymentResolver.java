ackage com.seikyuuressha.lms.resolver;

import com.seikyuuressha.lms.dto.request.InitiatePaymentRequest;
import com.seikyuuressha.lms.dto.response.PaymentResponse;
import com.seikyuuressha.lms.dto.response.RevenueReportResponse;
import com.seikyuuressha.lms.service.AdminService;
import com.seikyuuressha.lms.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class PaymentResolver {

    private final PaymentService paymentService;
    private final AdminService adminService;

    @QueryMapping
    public List<PaymentResponse> getMyPayments() {
        return paymentService.getMyPayments();
    }

    @QueryMapping
    public PaymentResponse getPaymentByTransaction(@Argument String transactionId) {
        return paymentService.getPaymentByTransaction(transactionId);
    }

    @MutationMapping
    public PaymentResponse initiatePayment(@Argument InitiatePaymentRequest input) {
        HttpServletRequest request = getCurrentRequest();
        String ipAddress = getClientIP(request);
        return paymentService.initiatePayment(input, ipAddress);
    }

    @MutationMapping
    public PaymentResponse confirmPayment(@Argument String transactionId,
                                          @Argument("vnp_ResponseCode") String vnpResponseCode) {
        return paymentService.confirmPayment(transactionId, vnpResponseCode);
    }

    private HttpServletRequest getCurrentRequest() {
        return ((org.springframework.web.context.request.ServletRequestAttributes) 
                org.springframework.web.context.request.RequestContextHolder.currentRequestAttributes())
                .getRequest();
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    @QueryMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<PaymentResponse> getAllPayments(
            @Argument Integer page,
            @Argument Integer limit,
            @Argument String status) {
        return adminService.getAllPayments(page, limit, status);
    }

    @QueryMapping
    @PreAuthorize("hasRole('ADMIN')")
    public RevenueReportResponse getRevenueReport(
            @Argument @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
            @Argument @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate) {
        return adminService.getRevenueReport(startDate, endDate);
    }
}
