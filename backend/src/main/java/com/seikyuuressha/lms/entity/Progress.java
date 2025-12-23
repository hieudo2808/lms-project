package com.seikyuuressha.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "Progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"userId", "lessonId"})
})
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Progress {
    @Id
    UUID progressId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", nullable = false)
    Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lessonId", nullable = false)
    Lesson lesson;

    @Column(nullable = false)
    Integer watchedSeconds;

    @Column(nullable = false)
    Double progressPercent;

    @Column(nullable = false)
    OffsetDateTime lastWatchedAt;

    @PrePersist
    protected void onCreate() {
        if (watchedSeconds == null) {
            watchedSeconds = 0;
        }
        if (progressPercent == null) {
            progressPercent = 0.0;
        }
        lastWatchedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        lastWatchedAt = OffsetDateTime.now();
    }
}
