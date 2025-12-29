ackage com.seikyuuressha.lms.repository;

import com.seikyuuressha.lms.entity.Payment;
import com.seikyuuressha.lms.entity.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findByUser(Users user);
    List<Payment> findByUserOrderByCreatedAtDesc(Users user);
    Optional<Payment> findByTransactionId(String transactionId);
    
    List<Payment> findByPaymentStatus(String paymentStatus);
    List<Payment> findByCourse_CourseIdAndPaymentStatus(UUID courseId, String paymentStatus);
    Page<Payment> findByPaymentStatus(String paymentStatus, Pageable pageable);
    
    List<Payment> findByCreatedAtBetween(OffsetDateTime startDate, OffsetDateTime endDate);
    
    boolean existsByEnrollment_EnrollmentIdAndPaymentStatus(UUID enrollmentId, String paymentStatus);
    Optional<Payment> findByEnrollment_EnrollmentId(UUID enrollmentId);

    @Query(value = """
        SELECT 
            YEAR(p.createdAt) as year,
            MONTH(p.createdAt) as month,
            COALESCE(SUM(p.amount), 0) as revenue
        FROM Payments p
        JOIN Courses c ON p.courseId = c.courseId
        WHERE c.instructorId = :instructorId
          AND p.paymentStatus = 'SUCCESS'
          AND p.createdAt >= :startDate
        GROUP BY YEAR(p.createdAt), MONTH(p.createdAt)
        ORDER BY YEAR(p.createdAt), MONTH(p.createdAt)
        """, nativeQuery = true)
    List<Object[]> getMonthlyRevenueByInstructor(
            @Param("instructorId") UUID instructorId,
            @Param("startDate") OffsetDateTime startDate);

    @Query(value = """
        SELECT 
            YEAR(p.createdAt) as year,
            MONTH(p.createdAt) as month,
            COALESCE(SUM(p.amount), 0) as revenue
        FROM Payments p
        WHERE p.courseId = :courseId
          AND p.paymentStatus = 'SUCCESS'
          AND p.createdAt >= :startDate
        GROUP BY YEAR(p.createdAt), MONTH(p.createdAt)
        ORDER BY YEAR(p.createdAt), MONTH(p.createdAt)
        """, nativeQuery = true)
    List<Object[]> getMonthlyRevenueByCourse(
            @Param("courseId") UUID courseId,
            @Param("startDate") OffsetDateTime startDate);
}
