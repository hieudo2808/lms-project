package com.seikyuuressha.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Entity
@Table(name = "Answers")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Answer {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID answerId;

    @Version
    Long version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "questionId", nullable = false)
    Question question;

    @Column(nullable = false, columnDefinition = "TEXT")
    String answerText;

    @Column(nullable = false)
    Boolean isCorrect;

    @Column(nullable = false)
    Integer orderIndex;

    @PrePersist
    protected void onCreate() {
        if (answerId == null) {
            answerId = UUID.randomUUID();
        }
        if (isCorrect == null) {
            isCorrect = false;
        }
        if (orderIndex == null) {
            orderIndex = 0;
        }
    }
}
