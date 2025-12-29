package com.seikyuuressha.lms.configuration;

import com.seikyuuressha.lms.entity.Roles;
import com.seikyuuressha.lms.entity.Users;
import com.seikyuuressha.lms.repository.RoleRepository;
import com.seikyuuressha.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String ADMIN_EMAIL = "hieudo831@gmail.com";

    @Override
    public void run(String... args) {
        if (userRepository.existsByEmail(ADMIN_EMAIL)) {
            log.info("Admin user already exists, skipping initialization");
            return;
        }

        Roles adminRole = roleRepository.findByRoleName("ADMIN");

        Users admin = Users.builder()
                .fullName("Do Hieu")
                .email(ADMIN_EMAIL)
                .password(passwordEncoder.encode("Admin@123"))
                .role(adminRole)
                .createdAt(OffsetDateTime.now())
                .isActive(true)
                .build();

        userRepository.save(admin);
    }
}
