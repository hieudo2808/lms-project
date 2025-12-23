package com.seikyuuressha.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "Questions")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID questionId;

    @Version
    Long version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quizId", nullable = false)
    Quiz quiz;

    @Column(nullable = false, columnDefinition = "TEXT")
    String questionText;

    @Column(name = "question_type", nullable = false)
    @Enumerated(EnumType.STRING)
    QuestionType type;

    @Column(nullable = false)
    Integer points; // Points for this question

    @Column(nullable = false)
    Integer orderIndex;

    @Column(columnDefinition = "TEXT")
    String explanation; // Explanation shown after answer

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<Answer> answers = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (questionId == null) {
            questionId = UUID.randomUUID();
        }
        if (points == null) {
            points = 1;
        }
    }

    public enum QuestionType {
        MULTIPLE_CHOICE,    // One correct answer
        MULTIPLE_SELECT,    // Multiple correct answers
        TRUE_FALSE,         // Boolean question
        SHORT_ANSWER        // Text input (auto-graded by keywords)
    }
}
