package com.seikyuuressha.lms.security.config;

import com.seikyuuressha.lms.configuration.PepperBCryptEncoder;
import com.seikyuuressha.lms.security.JwtAuthenticationFilter;
import com.seikyuuressha.lms.security.RateLimitFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.header.writers.XXssProtectionHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final RateLimitFilter rateLimitFilter;
        private final UserDetailsService userDetailsService;

        private final String[] PUBLIC_ENDPOINTS = {
                        "/graphql",
                        "/graphiql/**",
                        "/actuator/**",
                        "/api/auth/**"
        };

        @Value("${app.cors.allowed-origins}")
        private List<String> allowedEndpoints;

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new PepperBCryptEncoder(12);
        }

        @Bean
        public AuthenticationProvider authenticationProvider() {
                DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(passwordEncoder());
                authProvider.setUserDetailsService(userDetailsService);
                return authProvider;
        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
                return config.getAuthenticationManager();
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                .authorizeHttpRequests(request -> request
                                                .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                                                .anyRequest().authenticated())
                                .cors(Customizer.withDefaults())
                                .csrf(AbstractHttpConfigurer::disable)
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authenticationProvider(authenticationProvider())
                                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                                .headers(header -> header
                                                .contentTypeOptions(Customizer.withDefaults())
                                                .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)
                                                .xssProtection(xss -> xss.headerValue(
                                                                XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK))
                                                .referrerPolicy(ref -> ref
                                                                .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                                                .httpStrictTransportSecurity(hsts -> hsts
                                                                .maxAgeInSeconds(31536000)
                                                                .includeSubDomains(true)
                                                                .preload(true))
                                                .contentSecurityPolicy(csp -> csp
                                                                .policyDirectives(
                                                                                "default-src 'self'; " +
                                                                                                "script-src 'self' 'unsafe-inline' https://apis.google.com https://accounts.google.com https://sandbox.vnpayment.vn; " +
                                                                                                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                                                                                                "font-src 'self' https://fonts.gstatic.com; " +
                                                                                                "img-src 'self' data: https:; " +
                                                                                                "connect-src 'self' https://sandbox.vnpayment.vn https://api.vnpay.vn https://lms-be-opel.onrender.com https://*.s3.ap-southeast-1.amazonaws.com http://localhost:8080; " +
                                                                                                "frame-src https://accounts.google.com https://sandbox.vnpayment.vn")));

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                config.setAllowCredentials(true);
                config.setAllowedOrigins(allowedEndpoints);
                config.addAllowedHeader("*");
                config.setExposedHeaders(List.of("Authorization"));
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }
}
