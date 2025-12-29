package com.seikyuuressha.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "Enrollments", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "userId", "courseId" })
})
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Enrollment {
    @Id
    UUID enrollmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", nullable = false)
    Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "courseId", nullable = false)
    Course course;

    @Column(nullable = false)
    OffsetDateTime enrolledAt;

    @Column(nullable = false)
    Double progressPercent;

    @PrePersist
    protected void onCreate() {
        enrolledAt = OffsetDateTime.now();
        if (progressPercent == null) {
            progressPercent = 0.0;
        }
    }
}
