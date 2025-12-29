package com.seikyuuressha.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "Courses")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID courseId;

    @Column(nullable = false, length = 200)
    String title;

    @Column(nullable = false, unique = true, length = 150)
    String slug;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    String description;

    @Column(length = 255)
    String thumbnailUrl;

    @Column(length = 50)
    String level;

    @Column(precision = 10, scale = 2)
    BigDecimal price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoryId")
    Categories category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructorId")
    Users instructor;

    @Column(nullable = false)
    OffsetDateTime createdAt;

    @Column(nullable = false)
    OffsetDateTime updatedAt;

    @Column(nullable = false)
    boolean isPublished;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    List<Module> modules;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    List<Enrollment> enrollments;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    List<Review> reviews;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    List<CourseInstructor> courseInstructors;

    @Transient
    Integer totalLessons;

    @Transient
    Integer totalDuration;

    @Transient
    Double averageRating;

    @Transient
    Long reviewCount;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
