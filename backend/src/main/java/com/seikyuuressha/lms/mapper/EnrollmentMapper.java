package com.seikyuuressha.lms.mapper;

import com.seikyuuressha.lms.dto.response.EnrollmentResponse;
import com.seikyuuressha.lms.entity.Enrollment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EnrollmentMapper {

    @Mapping(target = "course", ignore = true)
    EnrollmentResponse toEnrollmentResponse(Enrollment enrollment);
}
