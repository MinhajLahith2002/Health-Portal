package lk.gamage.backend.healthbridgebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentRequestDto {

    private String departmentId;
    private String name;
    private String head;
    private Integer doctorsCount;
    private Integer staffCount;
    private String location;
    private String status;
    private String description;
    private String contactEmail;
    private String contactPhone;
    private String branchId;
    private String branchCode;
}
