package com.seikyuuressha.lms.service;

import com.seikyuuressha.lms.dto.request.InitiatePaymentRequest;
import com.seikyuuressha.lms.dto.response.PaymentResponse;
import com.seikyuuressha.lms.entity.*;
import com.seikyuuressha.lms.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final VNPayService vnPayService;

    @Transactional
    public PaymentResponse initiatePayment(InitiatePaymentRequest request, HttpServletRequest httpRequest) {
        UUID userId = getCurrentUserId();
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Check if already enrolled
        if (enrollmentRepository.existsByUserAndCourse(user, course)) {
            throw new RuntimeException("Already enrolled in this course");
        }

        // Create enrollment (pending payment)
        Enrollment enrollment = Enrollment.builder()
                .enrollmentId(UUID.randomUUID())
                .user(user)
                .course(course)
                .progressPercent(0.0)
                .build();
        enrollment = enrollmentRepository.save(enrollment);

        // Generate transaction ID
        String transactionId = vnPayService.generateTransactionId();

        // Create payment record
        Payment payment = Payment.builder()
                .paymentId(UUID.randomUUID())
                .user(user)
                .course(course)
                .enrollment(enrollment)
                .amount(course.getPrice())
                .paymentMethod(request.getPaymentProvider())  // Original column name
                .transactionId(transactionId)
                .paymentStatus("PENDING")  // Original values: SUCCESS, PENDING, FAILED
                .build();
        payment = paymentRepository.save(payment);

        // Generate payment URL based on provider
        String paymentUrl;
        if ("VNPAY".equals(request.getPaymentProvider())) {
            String ipAddress = getClientIP(httpRequest);
            paymentUrl = vnPayService.createPaymentUrl(payment, course, ipAddress);
        } else {
            throw new RuntimeException("Payment provider not supported yet");
        }

        return mapToResponse(payment);
    }

    @Transactional
    public PaymentResponse confirmPayment(String transactionId, Map<String, String> params) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (!payment.isPending()) {
            throw new RuntimeException("Payment already processed");
        }

        // Validate callback based on provider
        if ("VNPAY".equals(payment.getPaymentMethod())) {
            if (!vnPayService.validateCallback(params)) {
                payment.setPaymentStatus("FAILED");
                paymentRepository.save(payment);
                throw new RuntimeException("Invalid payment callback signature");
            }

            String vnpResponseCode = params.get("vnp_ResponseCode");
            payment.setVnpayResponseCode(vnpResponseCode);
            payment.setPaymentStatus(vnPayService.getPaymentStatus(vnpResponseCode));
            
            if (payment.isSuccess()) {
                payment.setPaidAt(LocalDateTime.now());
            }
        }

        payment = paymentRepository.save(payment);
        return mapToResponse(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getMyPayments() {
        UUID userId = getCurrentUserId();
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Payment> payments = paymentRepository.findByUserOrderByCreatedAtDesc(user);
        return payments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByTransaction(String transactionId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        return mapToResponse(payment);
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .userId(payment.getUser().getUserId())
                .courseId(payment.getCourse().getCourseId())
                .enrollmentId(payment.getEnrollment() != null ? payment.getEnrollment().getEnrollmentId() : null)
                .amount(payment.getAmount())
                .paymentProvider(payment.getPaymentMethod())
                .transactionId(payment.getTransactionId())
                .vnpayResponseCode(payment.getVnpayResponseCode())
                .paymentStatus(payment.getPaymentStatus())
                .paidAt(payment.getPaidAt() != null
                    ? payment.getPaidAt().atOffset(ZoneOffset.UTC)
                    : null)
                .createdAt(payment.getCreatedAt() != null
                    ? payment.getCreatedAt().atOffset(ZoneOffset.UTC)
                    : null)
                .build();
    }

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return UUID.fromString(authentication.getName());
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
