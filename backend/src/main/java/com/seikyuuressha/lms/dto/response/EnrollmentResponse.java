package com.seikyuuressha.lms.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentResponse {
    private UUID enrollmentId;
    private CourseResponse course;
    private LocalDateTime enrolledAt;
    private Double progressPercent;
}
