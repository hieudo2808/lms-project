package com.seikyuuressha.lms.service.admin;

import com.seikyuuressha.lms.dto.response.PaymentResponse;
import com.seikyuuressha.lms.dto.response.RevenueReportResponse;
import com.seikyuuressha.lms.dto.response.SystemStatisticsResponse;
import com.seikyuuressha.lms.entity.Payment;
import com.seikyuuressha.lms.mapper.PaymentMapper;
import com.seikyuuressha.lms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StatisticsService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;

    
    @Transactional(readOnly = true)
    public SystemStatisticsResponse getSystemStatistics() {
        long totalUsers = userRepository.count();
        long totalInstructors = userRepository.countByRole_RoleName("INSTRUCTOR");
        long totalStudents = userRepository.countByRole_RoleName("STUDENT");
        long totalCourses = courseRepository.count();
        long publishedCourses = courseRepository.countByIsPublished(true);
        long unpublishedCourses = courseRepository.countByIsPublished(false);
        long totalEnrollments = enrollmentRepository.count();
        long totalPayments = paymentRepository.count();

        List<Payment> completedPayments = paymentRepository.findByPaymentStatus("SUCCESS");
        BigDecimal totalRevenue = completedPayments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long completedPaymentsCount = completedPayments.size();
        long pendingPayments = paymentRepository.findByPaymentStatus("PENDING").size();
        long failedPayments = paymentRepository.findByPaymentStatus("FAILED").size();

        return SystemStatisticsResponse.builder()
                .totalUsers(totalUsers)
                .totalInstructors(totalInstructors)
                .totalStudents(totalStudents)
                .totalCourses(totalCourses)
                .publishedCourses(publishedCourses)
                .unpublishedCourses(unpublishedCourses)
                .totalEnrollments(totalEnrollments)
                .totalPayments(totalPayments)
                .totalRevenue(totalRevenue)
                .completedPayments(completedPaymentsCount)
                .pendingPayments(pendingPayments)
                .failedPayments(failedPayments)
                .build();
    }

    
    @Transactional(readOnly = true)
    public RevenueReportResponse getRevenueReport(OffsetDateTime startDate, OffsetDateTime endDate) {
        if (startDate == null) {
            startDate = OffsetDateTime.now().minusMonths(1);
        }
        if (endDate == null) {
            endDate = OffsetDateTime.now();
        }

        List<Payment> allPayments = paymentRepository.findByCreatedAtBetween(startDate, endDate);

        List<Payment> completedPayments = allPayments.stream()
                .filter(p -> "SUCCESS".equals(p.getPaymentStatus()))
                .collect(Collectors.toList());

        BigDecimal totalRevenue = completedPayments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalPaymentsCount = allPayments.size();
        long completedCount = completedPayments.size();
        long pendingCount = allPayments.stream()
                .filter(p -> "PENDING".equals(p.getPaymentStatus()))
                .count();
        long failedCount = allPayments.stream()
                .filter(p -> "FAILED".equals(p.getPaymentStatus()))
                .count();

        BigDecimal averagePayment = completedCount > 0 ?
                totalRevenue.divide(BigDecimal.valueOf(completedCount), 2, RoundingMode.HALF_UP) :
                BigDecimal.ZERO;

        return RevenueReportResponse.builder()
                .totalRevenue(totalRevenue)
                .totalPayments(totalPaymentsCount)
                .completedPayments(completedCount)
                .pendingPayments(pendingCount)
                .failedPayments(failedCount)
                .averagePayment(averagePayment)
                .startDate(startDate)
                .endDate(endDate)
                .build();
    }

    
    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments(Integer page, Integer limit, String status) {
        int pageIndex = (page != null && page > 0) ? page - 1 : 0;
        int pageSize = (limit != null && limit > 0) ? limit : 20;

        Pageable pageable = PageRequest.of(pageIndex, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Payment> paymentsPage;
        if (status != null && !status.isEmpty()) {
            paymentsPage = paymentRepository.findByPaymentStatus(status, pageable);
        } else {
            paymentsPage = paymentRepository.findAll(pageable);
        }

        return paymentsPage.getContent().stream()
                .map(paymentMapper::toPaymentResponse)
                .collect(Collectors.toList());
    }
}
