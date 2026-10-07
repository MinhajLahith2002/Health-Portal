package lk.gamage.backend.healthbridgebackend.service.impl;

import lk.gamage.backend.healthbridgebackend.dto.BranchRequestDto;
import lk.gamage.backend.healthbridgebackend.dto.BranchResponseDto;
import lk.gamage.backend.healthbridgebackend.exception.AlreadyExistsException;
import lk.gamage.backend.healthbridgebackend.exception.BadRequestException;
import lk.gamage.backend.healthbridgebackend.exception.ResourceNotFoundException;
import lk.gamage.backend.healthbridgebackend.model.Branch;
import lk.gamage.backend.healthbridgebackend.repository.BranchRepository;
import lk.gamage.backend.healthbridgebackend.service.BranchService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BranchServiceImpl implements BranchService {

    private final BranchRepository branchRepository;

    @Override
    public List<BranchResponseDto> getAllBranches() {
        return branchRepository.findAll().stream()
                .map(BranchResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public BranchResponseDto getBranchById(String id) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with ID: " + id));
        return BranchResponseDto.fromEntity(branch);
    }

    @Override
    public BranchResponseDto createBranch(BranchRequestDto request) {
        if (request == null || request.getBranchName() == null || request.getBranchName().trim().isEmpty()) {
            throw new BadRequestException("Branch name is required.");
        }

        String branchCode = request.getBranchCode();
        if (branchCode == null || branchCode.trim().isEmpty()) {
            branchCode = generateBranchCode(request.getCity());
        } else {
            branchCode = branchCode.trim().toUpperCase();
            if (branchRepository.findByBranchCode(branchCode).isPresent()) {
                throw new AlreadyExistsException("Branch code already exists: " + branchCode);
            }
        }

        Branch branch = Branch.builder()
                .branchCode(branchCode)
                .branchName(request.getBranchName().trim())
                .hospitalId(request.getHospitalId() != null ? request.getHospitalId() : "HOSP-001")
                .address(request.getAddress())
                .city(request.getCity())
                .phone(request.getPhone())
                .email(request.getEmail())
                .status(request.getStatus() != null ? request.getStatus().toUpperCase() : "ACTIVE")
                .totalBeds(request.getTotalBeds() != null ? request.getTotalBeds() : 0)
                .emergencyReady(request.getEmergencyReady() != null ? request.getEmergencyReady() : false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Branch saved = branchRepository.save(branch);
        return BranchResponseDto.fromEntity(saved);
    }

    private String generateBranchCode(String city) {
        long count = branchRepository.count() + 1;
        String prefix = "BR";
        if (city != null && !city.trim().isEmpty()) {
            String cleanedCity = city.trim().replaceAll("[^a-zA-Z]", "").toUpperCase();
            if (cleanedCity.length() >= 3) {
                prefix = "BR-" + cleanedCity.substring(0, 3);
            } else if (!cleanedCity.isEmpty()) {
                prefix = "BR-" + cleanedCity;
            }
        }

        String candidate = String.format("%s-%03d", prefix, count);
        long sequence = count;
        while (branchRepository.findByBranchCode(candidate).isPresent()) {
            sequence++;
            candidate = String.format("%s-%03d", prefix, sequence);
        }
        return candidate;
    }

    @Override
    public BranchResponseDto updateBranch(String id, BranchRequestDto request) {
        Branch existing = branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with ID: " + id));

        if (request.getBranchName() != null) existing.setBranchName(request.getBranchName());
        if (request.getAddress() != null) existing.setAddress(request.getAddress());
        if (request.getCity() != null) existing.setCity(request.getCity());
        if (request.getPhone() != null) existing.setPhone(request.getPhone());
        if (request.getEmail() != null) existing.setEmail(request.getEmail());
        if (request.getStatus() != null) existing.setStatus(request.getStatus().toUpperCase());
        if (request.getTotalBeds() != null) existing.setTotalBeds(request.getTotalBeds());
        if (request.getEmergencyReady() != null) existing.setEmergencyReady(request.getEmergencyReady());
        existing.setUpdatedAt(LocalDateTime.now());

        Branch updated = branchRepository.save(existing);
        return BranchResponseDto.fromEntity(updated);
    }

    @Override
    public void deleteBranch(String id) {
        if (!branchRepository.existsById(id)) {
            throw new ResourceNotFoundException("Branch not found with ID: " + id);
        }
        branchRepository.deleteById(id);
    }
}
