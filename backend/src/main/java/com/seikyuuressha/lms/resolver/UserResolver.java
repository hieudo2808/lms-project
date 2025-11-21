package com.seikyuuressha.lms.resolver;

import com.seikyuuressha.lms.dto.request.UpdateProfileRequest;
import com.seikyuuressha.lms.dto.response.UserResponse;
import com.seikyuuressha.lms.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class UserResolver {

    private final UserService userService;

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
}
