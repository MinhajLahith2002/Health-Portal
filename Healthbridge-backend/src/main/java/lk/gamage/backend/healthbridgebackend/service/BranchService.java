package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.BranchRequestDto;
import lk.gamage.backend.healthbridgebackend.dto.BranchResponseDto;

import java.util.List;

public interface BranchService {
    List<BranchResponseDto> getAllBranches();
    BranchResponseDto getBranchById(String id);
    BranchResponseDto createBranch(BranchRequestDto request);
    BranchResponseDto updateBranch(String id, BranchRequestDto request);
    void deleteBranch(String id);
}
