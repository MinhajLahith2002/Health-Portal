package lk.gamage.backend.healthbridgebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffResponseDto {

    private String id; // Matches frontend id (e.g. HB-4921)
    private String mongoId;
    private String staffId;
    private String firstName;
    private String lastName;
    private String role;
    private String department;
    private String email;
    private String phone;
    private String extension;
    private String dutyStatus;
    private String currentShift;
    private String avatarUrl;
    private String initials;
    private String dob;
    private String gender;
    private String bloodGroup;
    private String nationalId;
    private String residentialAddress;
    private String hireDate;
    private String emergencyContactName;
    private String emergencyContactRelation;
    private String emergencyContactPhone;
    private String locationFloor;
    private String accountStatus;
    private String branchId;
    private String branchCode;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
