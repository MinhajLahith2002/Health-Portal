package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.DepartmentRequestDto;
import lk.gamage.backend.healthbridgebackend.dto.DepartmentResponseDto;
import lk.gamage.backend.healthbridgebackend.dto.DepartmentStatsDto;

import java.util.List;

public interface DepartmentService {

    DepartmentResponseDto createDepartment(DepartmentRequestDto request);

    List<DepartmentResponseDto> getAllDepartments(String status, String search);

    DepartmentResponseDto getDepartmentById(String id);

    DepartmentResponseDto updateDepartment(String id, DepartmentRequestDto request);

    DepartmentResponseDto updateDepartmentStatus(String id, String status);

    void deleteDepartment(String id);

    DepartmentStatsDto getDepartmentStats();
}
