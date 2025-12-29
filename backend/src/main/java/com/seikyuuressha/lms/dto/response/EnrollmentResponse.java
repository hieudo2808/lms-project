package com.seikyuuressha.lms.dto.response;

import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentResponse {
    private UUID enrollmentId;
    private CourseResponse course;
    private OffsetDateTime enrolledAt;
    private Double progressPercent;
}

