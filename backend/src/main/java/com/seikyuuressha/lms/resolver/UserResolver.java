package com.seikyuuressha.lms.resolver;

import com.seikyuuressha.lms.dto.request.UpdateProfileRequest;
import com.seikyuuressha.lms.dto.response.RoleResponse;
import com.seikyuuressha.lms.dto.response.UserResponse;
import com.seikyuuressha.lms.repository.RoleRepository;
import com.seikyuuressha.lms.service.AdminService;
import com.seikyuuressha.lms.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
public class UserResolver {

    private final UserService userService;
    private final AdminService adminService;
    private final RoleRepository roleRepository;

    // ==================== USER QUERIES ====================

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public UserResponse me() {
        return userService.getCurrentUser();
    }

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public UserResponse getUserById(@Argument UUID userId) {
        return userService.getUserById(userId);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public UserResponse updateProfile(@Argument("input") UpdateProfileRequest input) {
        return userService.updateProfile(input);
    }

    @QueryMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(role -> RoleResponse.builder()
                        .roleId(role.getRoleId())
                        .roleName(role.getRoleName())
                        .build())
                .collect(Collectors.toList());
    }

    @QueryMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getAllUsers(
            @Argument Integer page,
            @Argument Integer limit,
            @Argument String roleName) {
        return adminService.getAllUsers(page, limit, roleName);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse updateUserRole(@Argument UUID userId, @Argument UUID roleId) {
        return adminService.updateUserRole(userId, roleId);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Boolean lockUser(@Argument UUID userId, @Argument String reason) {
        return adminService.lockUser(userId, reason);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Boolean unlockUser(@Argument UUID userId) {
        return adminService.unlockUser(userId);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Boolean deleteUser(@Argument UUID userId) {
        return adminService.deleteUser(userId);
    }
}
