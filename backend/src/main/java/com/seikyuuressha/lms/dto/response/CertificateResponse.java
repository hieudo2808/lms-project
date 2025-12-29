ackage com.seikyuuressha.lms.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.OffsetDateTime;
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
    OffsetDateTime issuedAt;
    Boolean isValid;
    OffsetDateTime revokedAt;
    String revocationReason;
}
