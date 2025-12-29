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
    String paymentProvider;
    String transactionId;
    String vnpayResponseCode;
    String paymentStatus;
    String paymentUrl;
    OffsetDateTime paidAt;
    OffsetDateTime createdAt;
}
