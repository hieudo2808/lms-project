package com.seikyuuressha.lms.repository;

import com.seikyuuressha.lms.entity.Payment;
import com.seikyuuressha.lms.entity.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findByUser(Users user);
    List<Payment> findByUserOrderByCreatedAtDesc(Users user);
    Optional<Payment> findByTransactionId(String transactionId);
    
    // Using original DB column: paymentStatus (values: SUCCESS, PENDING, FAILED)
    List<Payment> findByPaymentStatus(String paymentStatus);
    List<Payment> findByCourse_CourseIdAndPaymentStatus(UUID courseId, String paymentStatus);
    Page<Payment> findByPaymentStatus(String paymentStatus, Pageable pageable);
    
    List<Payment> findByCreatedAtBetween(OffsetDateTime startDate, OffsetDateTime endDate);
    
    // Check if enrollment has successful payment
    boolean existsByEnrollment_EnrollmentIdAndPaymentStatus(UUID enrollmentId, String paymentStatus);
    Optional<Payment> findByEnrollment_EnrollmentId(UUID enrollmentId);
}
