package com.seikyuuressha.lms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InitiatePaymentRequest {
    @NotNull(message = "Course ID is required")
    UUID courseId;

    @NotBlank(message = "Payment provider is required")
    String paymentProvider;  // VNPAY, MOMO, ZALOPAY, BANK_TRANSFER

    @NotBlank(message = "Return URL is required")
    String returnUrl;
}
