package com.seikyuuressha.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "Payments")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID paymentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", nullable = false)
    Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "courseId", nullable = false)
    Course course;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollmentId")
    Enrollment enrollment;

    @Column(nullable = false)
    BigDecimal amount;

    @Column(name = "currency")
    String currency;

    @Column(name = "paymentMethod")
    String paymentMethod;

    @Column(name = "paymentStatus")
    String paymentStatus;

    @Column(unique = true)
    String transactionId;

    String vnpayOrderInfo;
    String vnpayResponseCode;

    @Column(nullable = false)
    OffsetDateTime createdAt;

    OffsetDateTime paidAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
        if (currency == null) {
            currency = "VND";
        }
        if (paymentStatus == null) {
            paymentStatus = "PENDING";
        }
    }

    public boolean isSuccess() {
        return "SUCCESS".equals(paymentStatus);
    }

    public boolean isPending() {
        return "PENDING".equals(paymentStatus);
    }

    public boolean isFailed() {
        return "FAILED".equals(paymentStatus);
    }
}
