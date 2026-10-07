package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.*;

import java.util.List;

public interface BedService {

    BedResponseDto createBed(BedRequestDto request);

    List<BedResponseDto> getAllBeds(String ward, String status, String search);

    BedResponseDto getBedById(String id);

    BedResponseDto updateBed(String id, BedRequestDto request);

    BedResponseDto updateBedStatus(String id, String status);

    BedResponseDto allocateBed(String id, BedAllocationRequestDto request);

    BedResponseDto transferPatient(String id, BedTransferRequestDto request);

    void deleteBed(String id);

    BedStatsDto getBedStats();

    List<DepartmentOccupancyDto> getDepartmentOccupancy();
}
