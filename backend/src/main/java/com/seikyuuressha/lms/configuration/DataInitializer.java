package com.seikyuuressha.lms.configuration;

import com.seikyuuressha.lms.entity.Roles;
import com.seikyuuressha.lms.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        // 1. Tạo role STUDENT nếu chưa có
        if (roleRepository.findByRoleName("STUDENT").isEmpty()) {
            roleRepository.save(Roles.builder()
                    .roleId(UUID.randomUUID())
                    .roleName("STUDENT")
                    .build());
            System.out.println(">>> Đã tạo Role: STUDENT");
        }

        // 2. Tạo role INSTRUCTOR nếu chưa có
        if (roleRepository.findByRoleName("INSTRUCTOR").isEmpty()) {
            roleRepository.save(Roles.builder()
                    .roleId(UUID.randomUUID())
                    .roleName("INSTRUCTOR")
                    .build());
            System.out.println(">>> Đã tạo Role: INSTRUCTOR");
        }

        // 3. Tạo role ADMIN nếu chưa có
        if (roleRepository.findByRoleName("ADMIN").isEmpty()) {
            roleRepository.save(Roles.builder()
                    .roleId(UUID.randomUUID())
                    .roleName("ADMIN")
                    .build());
            System.out.println(">>> Đã tạo Role: ADMIN");
        }
    }
}