package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.StaffRequestDto;
import lk.gamage.backend.healthbridgebackend.dto.StaffResponseDto;
import lk.gamage.backend.healthbridgebackend.dto.StaffStatsDto;

import java.util.List;

public interface StaffService {

    List<StaffResponseDto> getAllStaff(String department, String dutyStatus, String accountStatus, String search);

    StaffResponseDto getStaffById(String id);

    StaffResponseDto createStaff(StaffRequestDto request);

    StaffResponseDto updateStaff(String id, StaffRequestDto request);

    StaffResponseDto updateDutyStatus(String id, String dutyStatus);

    StaffResponseDto updateAccountStatus(String id, String accountStatus);

    void deleteStaff(String id);

    StaffStatsDto getStaffStats();
}
