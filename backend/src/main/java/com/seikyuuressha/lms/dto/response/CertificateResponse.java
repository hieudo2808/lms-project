package com.seikyuuressha.lms.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CertificateResponse {
    UUID certificateId;
    UUID userId;
    UUID courseId;
    String certificateCode;
    String pdfUrl;
    Double finalScore;
    LocalDateTime issuedAt;
    Boolean isValid;
    LocalDateTime revokedAt;
    String revocationReason;
}
