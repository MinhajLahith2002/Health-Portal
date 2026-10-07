package lk.gamage.backend.healthbridgebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffStatsDto {

    private long totalActiveStaff;
    private long newThisMonth;
    private long onDutyCount;
    private long openShiftAlerts;
    private long pendingLeaveRequests;
}
