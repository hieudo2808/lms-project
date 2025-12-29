package com.seikyuuressha.lms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "Videos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Video {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "videoId", updatable = false, nullable = false)
    private UUID videoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lessonId", nullable = false)
    private Lesson lesson;

    @Column(name = "s3Key", nullable = false, length = 500)
    private String s3Key;

    @Column(name = "s3Bucket", nullable = false, length = 100)
    private String s3Bucket;

    @Column(name = "originalFilename", length = 255)
    private String originalFilename;

    @Column(name = "fileSize")
    private Long fileSize;

    @Column(name = "mimeType", length = 100)
    private String mimeType;

    @Column(name = "durationSeconds")
    private Integer durationSeconds;

    @Enumerated(EnumType.STRING)
    @Column(name = "processingStatus", nullable = false, length = 20)
    private ProcessingStatus processingStatus;

    @Column(name = "uploadedAt", nullable = false)
    private OffsetDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        uploadedAt = OffsetDateTime.now();
        if (processingStatus == null) {
            processingStatus = ProcessingStatus.PENDING;
        }
    }

    public enum ProcessingStatus {
        PENDING,
        COMPLETED,
        FAILED
    }
}
