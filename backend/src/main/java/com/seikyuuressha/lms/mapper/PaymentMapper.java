package com.seikyuuressha.lms.mapper;

import com.seikyuuressha.lms.dto.response.PaymentResponse;
import com.seikyuuressha.lms.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    @Mapping(target = "userId", source = "user.userId")
    @Mapping(target = "courseId", source = "course.courseId")
    @Mapping(target = "enrollmentId", source = "enrollment.enrollmentId")
    @Mapping(target = "paymentProvider", source = "paymentMethod")
    PaymentResponse toPaymentResponse(Payment payment);
}
