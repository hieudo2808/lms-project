package com.seikyuuressha.lms.mapper;

import com.seikyuuressha.lms.dto.response.CertificateResponse;
import com.seikyuuressha.lms.entity.Certificate;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CertificateMapper {

    @Mapping(target = "userId", source = "user.userId")
    @Mapping(target = "courseId", source = "course.courseId")
    @Mapping(target = "revocationReason", source = "revokedReason")
    CertificateResponse toCertificateResponse(Certificate certificate);
}
