ackage com.seikyuuressha.lms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueReportResponse {

    private BigDecimal totalRevenue;
    private Long totalPayments;
    private Long completedPayments;
    private Long pendingPayments;
    private Long failedPayments;
    private BigDecimal averagePayment;
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
}
