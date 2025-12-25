package com.seikyuuressha.lms.dto.response;

import com.seikyuuressha.lms.entity.Payment;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentResponse {
    UUID paymentId;
    UUID userId;
    UUID courseId;
    UUID enrollmentId;
    BigDecimal amount;
    String paymentProvider;      // Original DB: paymentMethod (VNPAY, MOMO, etc.)
    String transactionId;
    String vnpayResponseCode;
    String paymentStatus;        // Original DB: paymentStatus (SUCCESS, PENDING, FAILED)
    String paymentUrl;           // For redirect URL in initiatePayment response
    OffsetDateTime paidAt;
    OffsetDateTime createdAt;
}
