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
import java.util.Collections;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
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

        Users admin = Users.builder()
                .fullName("System Admin")
                .email("admin@lms.com")
                .password(passwordEncoder.encode("password123"))
                .role(adminRole)
                .isActive(true)
                .createdAt(OffsetDateTime.now())
                .build();

        userRepository.save(admin);
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
}
