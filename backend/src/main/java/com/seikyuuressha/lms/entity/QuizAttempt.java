package com.seikyuuressha.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "QuizAttempts")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID attemptId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quizId", nullable = false)
    Quiz quiz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", nullable = false)
    Users user;

    @Column(nullable = false)
    Integer attemptNumber;

    @Column(nullable = false)
    OffsetDateTime startedAt;

    OffsetDateTime submittedAt;

    @Column(nullable = false)
    Integer totalScore;

    @Column(nullable = false)
    Integer maxScore;

    Double percentage;

    @Column(name = "attempt_status", nullable = false)
    @Enumerated(EnumType.STRING)
    AttemptStatus status;

    @Column(nullable = false)
    Boolean passed;

    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<QuizAnswer> answers = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (attemptId == null) {
            attemptId = UUID.randomUUID();
        }
        if (startedAt == null) {
            startedAt = OffsetDateTime.now();
        }
        if (status == null) {
            status = AttemptStatus.IN_PROGRESS;
        }
        if (totalScore == null) {
            totalScore = 0;
        }
        if (passed == null) {
            passed = false;
        }
    }

    public enum AttemptStatus {
        IN_PROGRESS,
        SUBMITTED,
        GRADED,
        EXPIRED
    }
}
