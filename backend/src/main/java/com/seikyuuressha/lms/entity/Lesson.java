package com.seikyuuressha.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "Lessons")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Lesson {
    @Id
    UUID lessonId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "moduleId", nullable = false)
    Module module;

    @Column(nullable = false, length = 200)
    String title;

    @Column(length = 255)
    String videoUrl;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    String content;

    Integer durationSeconds;

    @Column(name = "order", nullable = false)
    int order;

    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL)
    List<Progress> progresses;

    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL)
    List<LessonResource> resources;
}
