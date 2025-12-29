package com.seikyuuressha.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "Quizzes")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Quiz {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID quizId;

    @Version
    Long version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "courseId", nullable = false)
    Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "moduleId")
    Module module;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lessonId")
    Lesson lesson;

    @Column(nullable = false)
    String title;

    @Column(columnDefinition = "TEXT")
    String description;

    @Column(nullable = false)
    Integer passingScore;

    @Column(nullable = false)
    Integer timeLimit;

    @Column(nullable = false)
    Integer maxAttempts;

    @Column(nullable = false)
    Boolean isPublished;

    @Column(nullable = false)
    Integer orderIndex;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<Question> questions = new ArrayList<>();

    @Column(nullable = false)
    OffsetDateTime createdAt;

    OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (quizId == null) {
            quizId = UUID.randomUUID();
        }
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
        if (isPublished == null) {
            isPublished = false;
        }
        if (orderIndex == null) {
            orderIndex = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
