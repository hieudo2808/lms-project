package com.seikyuuressha.lms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemStatisticsResponse {

    private Long totalUsers;
    private Long totalInstructors;
    private Long totalStudents;
    private Long totalCourses;
    private Long publishedCourses;
    private Long unpublishedCourses;
    private Long totalEnrollments;
    private Long totalPayments;
    private BigDecimal totalRevenue;
    private Long completedPayments;
    private Long pendingPayments;
    private Long failedPayments;
}
