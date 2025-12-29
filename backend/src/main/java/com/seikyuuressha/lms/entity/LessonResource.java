package com.seikyuuressha.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "LessonResources")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LessonResource {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID resourceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lessonId", nullable = false)
    Lesson lesson;

    @Column(length = 255)
    String fileName;

    @Column(length = 1000)
    String s3Key;

    @Column(length = 1000)
    String resourceUrl;

    @Column(length = 50)
    String resourceType;

    @Column
    Long fileSize;

    @Builder.Default
    OffsetDateTime createdAt = OffsetDateTime.now();
}
