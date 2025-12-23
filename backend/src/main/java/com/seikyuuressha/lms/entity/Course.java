package com.seikyuuressha.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
    @GeneratedValue(strategy = GenerationType.UUID) // Đây là dòng sửa lỗi DataSeeder
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
    String level; // Beginner, Intermediate, Advanced

    @Column(precision = 10, scale = 2)
    BigDecimal price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoryId")
    Categories category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructorId")
    Users instructor;

    @Column(nullable = false)
    LocalDateTime createdAt;

    @Column(nullable = false)
    LocalDateTime updatedAt;

    @Column(nullable = false)
    boolean isPublished;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    List<Module> modules;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    List<Enrollment> enrollments;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    List<Review> reviews;

    // Computed fields - giữ nguyên theo ý bạn
    @Transient
    Integer totalLessons;

    @Transient
    Integer totalDuration; // in seconds

    @Transient
    Double averageRating;

    @Transient
    Long reviewCount;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
