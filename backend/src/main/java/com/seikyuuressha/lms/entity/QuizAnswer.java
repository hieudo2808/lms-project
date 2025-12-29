ackage com.seikyuuressha.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "QuizAnswers")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID quizAnswerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attemptId", nullable = false)
    QuizAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "questionId", nullable = false)
    Question question;

    @ManyToMany
    @JoinTable(
        name = "QuizAnswerSelections",
        joinColumns = @JoinColumn(name = "quizAnswerId"),
        inverseJoinColumns = @JoinColumn(name = "answerId")
    )
    @Builder.Default
    List<Answer> selectedAnswers = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    String textAnswer;

    @Column(nullable = false)
    Boolean isCorrect;

    @Column(nullable = false)
    Integer pointsEarned;

    @Column(nullable = false)
    OffsetDateTime answeredAt;

    @PrePersist
    protected void onCreate() {
        if (quizAnswerId == null) {
            quizAnswerId = UUID.randomUUID();
        }
        if (answeredAt == null) {
            answeredAt = OffsetDateTime.now();
        }
        if (isCorrect == null) {
            isCorrect = false;
        }
        if (pointsEarned == null) {
            pointsEarned = 0;
        }
    }
}
