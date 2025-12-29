ackage com.seikyuuressha.lms.resolver;

import com.seikyuuressha.lms.dto.response.SystemStatisticsResponse;
import com.seikyuuressha.lms.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class StatisticsResolver {

    private final AdminService adminService;

    @QueryMapping
    @PreAuthorize("hasRole('ADMIN')")
    public SystemStatisticsResponse getSystemStatistics() {
        return adminService.getSystemStatistics();
    }
}
