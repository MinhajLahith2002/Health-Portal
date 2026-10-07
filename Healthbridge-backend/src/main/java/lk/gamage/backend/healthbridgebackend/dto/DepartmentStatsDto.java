package lk.gamage.backend.healthbridgebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentStatsDto {

    private long totalDepartments;
    private long activeDepartments;
    private long totalDoctors;
    private long totalDepartmentStaff;
}
