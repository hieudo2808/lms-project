package com.seikyuuressha.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "CourseInstructors")
@IdClass(CourseInstructorId.class)
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseInstructor {

    public enum InstructorRole {
        OWNER,
        CO_INSTRUCTOR
    }

    @Id
    @Column(name = "courseId")
    UUID courseId;

    @Id
    @Column(name = "userId")
    UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "courseId", insertable = false, updatable = false)
    Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", insertable = false, updatable = false)
    Users user;

    @Enumerated(EnumType.STRING)
    @Column(name = "userRole", length = 50, nullable = false)
    @Builder.Default
    InstructorRole userRole = InstructorRole.CO_INSTRUCTOR;

    @Column(nullable = false)
    OffsetDateTime addedAt;

    @PrePersist
    protected void onCreate() {
        addedAt = OffsetDateTime.now();
    }
}
