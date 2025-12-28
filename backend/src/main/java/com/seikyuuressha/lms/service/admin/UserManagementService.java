package com.seikyuuressha.lms.service.admin;

import com.seikyuuressha.lms.dto.response.UserResponse;
import com.seikyuuressha.lms.entity.Roles;
import com.seikyuuressha.lms.entity.Users;
import com.seikyuuressha.lms.mapper.UserMapper;
import com.seikyuuressha.lms.repository.CourseRepository;
import com.seikyuuressha.lms.repository.EnrollmentRepository;
import com.seikyuuressha.lms.repository.RoleRepository;
import com.seikyuuressha.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for admin user management operations.
 * Extracted from AdminService for SRP compliance.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserManagementService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    /**
     * Get all users with pagination
     */
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers(Integer page, Integer limit, String roleName) {
        int pageIndex = (page != null && page > 0) ? page - 1 : 0;
        int pageSize = (limit != null && limit > 0) ? limit : 20;

        Pageable pageable = PageRequest.of(pageIndex, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Users> usersPage;
        if (roleName != null && !roleName.isEmpty()) {
            usersPage = userRepository.findByRole_RoleName(roleName, pageable);
        } else {
            usersPage = userRepository.findAll(pageable);
        }

        return usersPage.getContent().stream()
                .map(userMapper::toUserResponse)
                .collect(Collectors.toList());
    }

    /**
     * Update user role
     */
    @Transactional
    public UserResponse updateUserRole(UUID userId, UUID roleId) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Roles role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        user.setRole(role);
        user = userRepository.save(user);

        log.info("User role updated. UserId: {}, NewRole: {}", userId, role.getRoleName());
        return userMapper.toUserResponse(user);
    }

    /**
     * Lock user account
     */
    @Transactional
    public Boolean lockUser(UUID userId, String reason) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if ("ADMIN".equals(user.getRole().getRoleName())) {
            throw new RuntimeException("Cannot lock admin user");
        }

        user.setActive(false);
        userRepository.save(user);

        log.info("User locked. UserId: {}, Reason: {}", userId, reason);
        return true;
    }

    /**
     * Unlock user account
     */
    @Transactional
    public Boolean unlockUser(UUID userId) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setActive(true);
        userRepository.save(user);

        log.info("User unlocked. UserId: {}", userId);
        return true;
    }

    /**
     * Delete user (soft delete by deactivating)
     */
    @Transactional
    public Boolean deleteUser(UUID userId) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if ("ADMIN".equals(user.getRole().getRoleName())) {
            throw new RuntimeException("Cannot delete admin user");
        }

        boolean hasEnrollments = enrollmentRepository.existsByUser_UserId(userId);
        boolean hasCourses = !courseRepository.findByInstructor_UserId(userId).isEmpty();

        if (hasEnrollments || hasCourses) {
            user.setActive(false);
            userRepository.save(user);
            log.info("User soft deleted (deactivated). UserId: {}", userId);
        } else {
            userRepository.delete(user);
            log.info("User hard deleted. UserId: {}", userId);
        }

        return true;
    }

    /**
     * Create new user (admin only)
     */
    @Transactional
    public UserResponse createUser(String fullName, String email, String password, UUID roleId) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        Roles role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        Users user = Users.builder()
                .fullName(fullName)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(role)
                .isActive(true)
                .createdAt(java.time.OffsetDateTime.now())
                .build();

        user = userRepository.save(user);
        log.info("User created by admin. UserId: {}, Email: {}", user.getUserId(), email);
        return userMapper.toUserResponse(user);
    }

    /**
     * Update user info (admin only)
     */
    @Transactional
    public UserResponse updateUser(UUID userId, String fullName, String email, String password, UUID roleId) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check email uniqueness if changed
        if (email != null && !email.equals(user.getEmail())) {
            if (userRepository.existsByEmail(email)) {
                throw new RuntimeException("Email already exists");
            }
            user.setEmail(email);
        }

        if (fullName != null && !fullName.isEmpty()) {
            user.setFullName(fullName);
        }

        if (password != null && !password.isEmpty()) {
            user.setPassword(passwordEncoder.encode(password));
        }

        if (roleId != null) {
            Roles role = roleRepository.findById(roleId)
                    .orElseThrow(() -> new RuntimeException("Role not found"));
            user.setRole(role);
        }

        user = userRepository.save(user);
        log.info("User updated by admin. UserId: {}", userId);
        return userMapper.toUserResponse(user);
    }
}
