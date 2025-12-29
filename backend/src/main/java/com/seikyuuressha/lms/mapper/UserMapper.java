package com.seikyuuressha.lms.mapper;

import com.seikyuuressha.lms.dto.response.InstructorResponse;
import com.seikyuuressha.lms.dto.response.UserResponse;
import com.seikyuuressha.lms.entity.Users;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "roleName", source = "role.roleName")
    @Mapping(target = "isActive", source = "active")
    UserResponse toUserResponse(Users user);

    InstructorResponse toInstructorResponse(Users user);
}
