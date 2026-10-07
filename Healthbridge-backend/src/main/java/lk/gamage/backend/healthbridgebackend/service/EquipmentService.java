package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.EquipmentRequestDto;
import lk.gamage.backend.healthbridgebackend.dto.EquipmentResponseDto;
import lk.gamage.backend.healthbridgebackend.dto.EquipmentStatsDto;

import java.util.List;

public interface EquipmentService {
    List<EquipmentResponseDto> getAllEquipment(String category, String department, String status, String search);
    EquipmentResponseDto getEquipmentById(String id);
    EquipmentResponseDto createEquipment(EquipmentRequestDto request);
    EquipmentResponseDto updateEquipment(String id, EquipmentRequestDto request);
    EquipmentResponseDto updateEquipmentStatus(String id, String status);
    void deleteEquipment(String id);
    EquipmentStatsDto getEquipmentStats();
    List<String> getLocationsByDepartment(String department);
}
