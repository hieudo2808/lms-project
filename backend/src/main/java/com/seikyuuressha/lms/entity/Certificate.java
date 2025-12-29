package com.seikyuuressha.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "Certificates", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"userId", "courseId"})
})
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Certificate {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID certificateId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", nullable = false)
    Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "courseId", nullable = false)
    Course course;

    @Column(nullable = false, unique = true)
    String certificateCode; // e.g., "LMS-2025-001234"

    @Column(nullable = false)
    String pdfUrl;

    @Column(nullable = false)
    OffsetDateTime issuedAt;

    Double finalScore;

    @Column(columnDefinition = "TEXT")
    String completionNote;

    @Column(nullable = false)
    Boolean isValid;

    OffsetDateTime revokedAt;
    String revokedReason;

    @PrePersist
    protected void onCreate() {
        if (certificateId == null) {
            certificateId = UUID.randomUUID();
        }
        if (issuedAt == null) {
            issuedAt = OffsetDateTime.now();
        }
        if (isValid == null) {
            isValid = true;
        }
        if (certificateCode == null) {
            certificateCode = generateCertificateCode();
        }
    }

    private String generateCertificateCode() {
        return "LMS-" + 
               OffsetDateTime.now().getYear() + "-" + 
               String.format("%06d", (int)(Math.random() * 1000000));
    }
}
