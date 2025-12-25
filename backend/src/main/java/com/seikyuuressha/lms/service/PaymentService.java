package com.seikyuuressha.lms.service;

import com.seikyuuressha.lms.dto.request.InitiatePaymentRequest;
import com.seikyuuressha.lms.dto.response.PaymentResponse;
import com.seikyuuressha.lms.entity.*;
import com.seikyuuressha.lms.mapper.PaymentMapper;
import com.seikyuuressha.lms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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
    private final PaymentMapper paymentMapper;

    @Transactional
    public PaymentResponse initiatePayment(InitiatePaymentRequest request, String ipAddress) {
        UUID userId = getCurrentUserId();
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Check if already enrolled with successful payment
        Optional<Enrollment> existingEnrollment = enrollmentRepository.findByUserAndCourse(user, course);
        Enrollment enrollment;
        
        if (existingEnrollment.isPresent()) {
            enrollment = existingEnrollment.get();
            Optional<Payment> existingPayment = paymentRepository.findByEnrollment_EnrollmentId(enrollment.getEnrollmentId());
            
            if (existingPayment.isPresent() && "SUCCESS".equals(existingPayment.get().getPaymentStatus())) {
                throw new RuntimeException("Already enrolled in this course");
            }
            
            // If payment is PENDING or FAILED, delete old payment and create new one
            if (existingPayment.isPresent()) {
                paymentRepository.delete(existingPayment.get());
            }
        } else {
            // Create new enrollment
            enrollment = Enrollment.builder()
                    .enrollmentId(UUID.randomUUID())
                    .user(user)
                    .course(course)
                    .progressPercent(0.0)
                    .build();
            enrollment = enrollmentRepository.save(enrollment);
        }

        // Generate transaction ID
        String transactionId = vnPayService.generateTransactionId();

        // Create payment record
        Payment payment = Payment.builder()
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
            paymentUrl = vnPayService.createPaymentUrl(payment, course, ipAddress);
        } else {
            throw new RuntimeException("Payment provider not supported yet");
        }

        PaymentResponse response = paymentMapper.toPaymentResponse(payment);
        response.setPaymentUrl(paymentUrl);
        return response;
    }

    @Transactional
    public PaymentResponse confirmPayment(String transactionId, String vnpResponseCode) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (!payment.isPending()) {
            throw new RuntimeException("Payment already processed");
        }

        if (!"VNPAY".equals(payment.getPaymentMethod())) {
            throw new RuntimeException("Payment provider not supported for confirmation");
        }

        payment.setVnpayResponseCode(vnpResponseCode);
        payment.setPaymentStatus(vnPayService.getPaymentStatus(vnpResponseCode));

        if (payment.isSuccess()) {
            payment.setPaidAt(OffsetDateTime.now());
        }

        payment = paymentRepository.save(payment);
        return paymentMapper.toPaymentResponse(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getMyPayments() {
        UUID userId = getCurrentUserId();
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Payment> payments = paymentRepository.findByUserOrderByCreatedAtDesc(user);
        return payments.stream()
                .map(paymentMapper::toPaymentResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByTransaction(String transactionId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        return paymentMapper.toPaymentResponse(payment);
    }

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return UUID.fromString(authentication.getName());
    }
}
