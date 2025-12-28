package com.seikyuuressha.lms.configuration;

import com.seikyuuressha.lms.entity.*;
import com.seikyuuressha.lms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final CourseRepository courseRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (roleRepository.count() == 0) {
            log.info("Starting data seeding...");
            try {
                log.info("Roles seeded successfully. Count: {}", roleRepository.count());
                
                seedUsers();
                log.info("Users seeded successfully. Count: {}", userRepository.count());
                
                seedCategories();
                log.info("Categories seeded successfully. Count: {}", categoryRepository.count());
                
                seedCourses();
                log.info("Courses seeded successfully. Count: {}", courseRepository.count());
                
                log.info("Data seeding completed successfully.");
            } catch (Exception e) {
                log.error("ERROR during data seeding: {}", e.getMessage(), e);
                throw e;
            }
        } else {
            log.info("Data seeding skipped - data already exists.");
        }
    }

    private void seedUsers() {
        Roles adminRole = roleRepository.findByRoleName("ADMIN").orElseThrow();
        Roles instructorRole = roleRepository.findByRoleName("INSTRUCTOR").orElseThrow();
        Roles studentRole = roleRepository.findByRoleName("STUDENT").orElseThrow();

        Users admin = Users.builder()
                .userId(UUID.fromString("11111111-1111-1111-1111-111111111111"))
                .fullName("System Admin")
                .email("admin@lms.com")
                .password(passwordEncoder.encode("password123"))
                .role(adminRole)
                .isActive(true)
                .createdAt(OffsetDateTime.now())
                .build();

        Users instructor = Users.builder()
                .userId(UUID.fromString("22222222-2222-2222-2222-222222222222"))
                .fullName("John Instructor")
                .email("instructor@lms.com")
                .password(passwordEncoder.encode("password123"))
                .role(instructorRole)
                .isActive(true)
                .bio("Expert Java Instructor with 10 years of experience.")
                .createdAt(OffsetDateTime.now())
                .build();

        Users student = Users.builder()
                .userId(UUID.fromString("74636AE8-2608-4AD9-AFEA-DDA16B7890E4"))
                .fullName("Alice Student")
                .email("student@lms.com")
                .password(passwordEncoder.encode("password123"))
                .role(studentRole)
                .isActive(true)
                .createdAt(OffsetDateTime.now())
                .build();

        userRepository.saveAll(Arrays.asList(admin, instructor, student));
        log.info("Seeded Users.");
    }

    private void seedCategories() {
        Categories webDev = Categories.builder()
                .name("Web Development")
                .slug("web-development")
                .description("Learn to build websites and web apps.")
                .build();

        Categories dataScience = Categories.builder()
                .name("Data Science")
                .slug("data-science")
                .description("Master data analysis and machine learning.")
                .build();

        Categories design = Categories.builder()
                .name("Design")
                .slug("design")
                .description("UI/UX Design and Graphic Design.")
                .build();

        categoryRepository.saveAll(Arrays.asList(webDev, dataScience, design));
        log.info("Seeded Categories.");
    }

    private void seedCourses() {
        Users instructor = userRepository.findByEmail("instructor@lms.com").orElseThrow();
        Categories webDev = categoryRepository.findBySlug("web-development").orElseThrow();

        Course springBoot = Course.builder()
                .title("Complete Spring Boot Guide")
                .slug("complete-spring-boot-guide")
                .description("Master Spring Boot 3, Spring Security, JPA, and GraphQL.")
                .price(new BigDecimal("49.99"))
                .level("Intermediate")
                .instructor(instructor)
                .category(webDev)
                .isPublished(true)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        courseRepository.save(springBoot);
        log.info("Seeded Courses.");
    }
}
