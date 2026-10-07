package lk.gamage.backend.healthbridgebackend.service.impl;

import lk.gamage.backend.healthbridgebackend.dto.DepartmentRequestDto;
import lk.gamage.backend.healthbridgebackend.dto.DepartmentResponseDto;
import lk.gamage.backend.healthbridgebackend.dto.DepartmentStatsDto;
import lk.gamage.backend.healthbridgebackend.exception.AlreadyExistsException;
import lk.gamage.backend.healthbridgebackend.exception.BadRequestException;
import lk.gamage.backend.healthbridgebackend.exception.ResourceNotFoundException;
import lk.gamage.backend.healthbridgebackend.model.Department;
import lk.gamage.backend.healthbridgebackend.repository.DepartmentRepository;
import lk.gamage.backend.healthbridgebackend.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");



    @Override
    public DepartmentResponseDto createDepartment(DepartmentRequestDto request) {
        validateRequest(request, null);

        String deptId = request.getDepartmentId();
        if (deptId == null || deptId.trim().isEmpty()) {
            long nextNum = departmentRepository.count() + 1;
            deptId = String.format("DEP-%03d", nextNum);
            while (departmentRepository.existsByDepartmentId(deptId)) {
                nextNum++;
                deptId = String.format("DEP-%03d", nextNum);
            }
        } else {
            if (departmentRepository.existsByDepartmentId(deptId.trim())) {
                throw new AlreadyExistsException("Department ID '" + deptId.trim() + "' is already in use.");
            }
        }

        String formattedStatus = normalizeStatus(request.getStatus());

        Department department = Department.builder()
                .departmentId(deptId.trim())
                .name(request.getName().trim())
                .head(request.getHead().trim())
                .doctorsCount(request.getDoctorsCount() != null ? request.getDoctorsCount() : 0)
                .staffCount(request.getStaffCount() != null ? request.getStaffCount() : 0)
                .location(request.getLocation().trim())
                .status(formattedStatus)
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .contactEmail(request.getContactEmail() != null ? request.getContactEmail().trim() : null)
                .contactPhone(request.getContactPhone() != null ? request.getContactPhone().trim() : null)
                .branchId(request.getBranchId() != null ? request.getBranchId() : "BR-COL-01")
                .branchCode(request.getBranchCode() != null ? request.getBranchCode() : "BR-COL-01")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Department saved = departmentRepository.save(department);
        return mapToDto(saved);
    }

    @Override
    public List<DepartmentResponseDto> getAllDepartments(String status, String search) {
        List<Department> departments;

        if (status != null && !status.trim().isEmpty() && !"All".equalsIgnoreCase(status)) {
            departments = departmentRepository.findByStatusIgnoreCase(status.trim());
        } else {
            departments = departmentRepository.findAll();
        }

        if (search != null && !search.trim().isEmpty()) {
            String lowerSearch = search.trim().toLowerCase();
            departments = departments.stream()
                    .filter(d -> (d.getName() != null && d.getName().toLowerCase().contains(lowerSearch)) ||
                            (d.getDepartmentId() != null && d.getDepartmentId().toLowerCase().contains(lowerSearch)) ||
                            (d.getHead() != null && d.getHead().toLowerCase().contains(lowerSearch)) ||
                            (d.getLocation() != null && d.getLocation().toLowerCase().contains(lowerSearch)))
                    .collect(Collectors.toList());
        }

        return departments.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public DepartmentResponseDto getDepartmentById(String id) {
        Department department = departmentRepository.findById(id)
                .orElseGet(() -> departmentRepository.findByDepartmentId(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id)));
        return mapToDto(department);
    }

    @Override
    public DepartmentResponseDto updateDepartment(String id, DepartmentRequestDto request) {
        Department department = departmentRepository.findById(id)
                .orElseGet(() -> departmentRepository.findByDepartmentId(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id)));

        validateRequestForUpdate(request, department.getId());

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            department.setName(request.getName().trim());
        }
        if (request.getHead() != null && !request.getHead().trim().isEmpty()) {
            department.setHead(request.getHead().trim());
        }
        if (request.getDoctorsCount() != null) {
            if (request.getDoctorsCount() < 0) {
                throw new BadRequestException("Doctors count cannot be negative.");
            }
            department.setDoctorsCount(request.getDoctorsCount());
        }
        if (request.getStaffCount() != null) {
            if (request.getStaffCount() < 0) {
                throw new BadRequestException("Staff count cannot be negative.");
            }
            department.setStaffCount(request.getStaffCount());
        }
        if (request.getLocation() != null && !request.getLocation().trim().isEmpty()) {
            department.setLocation(request.getLocation().trim());
        }
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            department.setStatus(normalizeStatus(request.getStatus()));
        }
        if (request.getDescription() != null) {
            department.setDescription(request.getDescription().trim());
        }
        if (request.getContactEmail() != null) {
            validateEmail(request.getContactEmail());
            department.setContactEmail(request.getContactEmail().trim());
        }
        if (request.getContactPhone() != null) {
            department.setContactPhone(request.getContactPhone().trim());
        }

        department.setUpdatedAt(LocalDateTime.now());

        Department updated = departmentRepository.save(department);
        return mapToDto(updated);
    }

    @Override
    public DepartmentResponseDto updateDepartmentStatus(String id, String status) {
        if (status == null || status.trim().isEmpty()) {
            throw new BadRequestException("Status parameter cannot be null or empty.");
        }
        String normalized = normalizeStatus(status);

        Department department = departmentRepository.findById(id)
                .orElseGet(() -> departmentRepository.findByDepartmentId(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id)));

        department.setStatus(normalized);
        department.setUpdatedAt(LocalDateTime.now());

        Department updated = departmentRepository.save(department);
        return mapToDto(updated);
    }

    @Override
    public void deleteDepartment(String id) {
        Department department = departmentRepository.findById(id)
                .orElseGet(() -> departmentRepository.findByDepartmentId(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id)));

        departmentRepository.delete(department);
    }

    @Override
    public DepartmentStatsDto getDepartmentStats() {
        List<Department> departments = departmentRepository.findAll();

        long totalDepartments = departments.size();
        long activeDepartments = departments.stream()
                .filter(d -> "Active".equalsIgnoreCase(d.getStatus()))
                .count();
        long totalDoctors = departments.stream()
                .mapToLong(d -> d.getDoctorsCount() != null ? d.getDoctorsCount() : 0)
                .sum();
        long totalStaff = departments.stream()
                .mapToLong(d -> d.getStaffCount() != null ? d.getStaffCount() : 0)
                .sum();

        return DepartmentStatsDto.builder()
                .totalDepartments(totalDepartments)
                .activeDepartments(activeDepartments)
                .totalDoctors(totalDoctors)
                .totalDepartmentStaff(totalStaff)
                .build();
    }

    private void validateRequest(DepartmentRequestDto request, String existingId) {
        if (request == null) {
            throw new BadRequestException("Request body cannot be null.");
        }
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new BadRequestException("Department name is required.");
        }
        if (request.getHead() == null || request.getHead().trim().isEmpty()) {
            throw new BadRequestException("Department head is required.");
        }
        if (request.getLocation() == null || request.getLocation().trim().isEmpty()) {
            throw new BadRequestException("Department location is required.");
        }
        if (request.getDoctorsCount() != null && request.getDoctorsCount() < 0) {
            throw new BadRequestException("Doctors count cannot be negative.");
        }
        if (request.getStaffCount() != null && request.getStaffCount() < 0) {
            throw new BadRequestException("Staff count cannot be negative.");
        }
        validateEmail(request.getContactEmail());

        departmentRepository.findByNameIgnoreCase(request.getName().trim()).ifPresent(existing -> {
            if (existingId == null || !existing.getId().equals(existingId)) {
                throw new AlreadyExistsException("A department with the name '" + request.getName().trim() + "' already exists.");
            }
        });
    }

    private void validateRequestForUpdate(DepartmentRequestDto request, String existingId) {
        if (request == null) {
            throw new BadRequestException("Request body cannot be null.");
        }
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            departmentRepository.findByNameIgnoreCase(request.getName().trim()).ifPresent(existing -> {
                if (!existing.getId().equals(existingId)) {
                    throw new AlreadyExistsException("A department with the name '" + request.getName().trim() + "' already exists.");
                }
            });
        }
        if (request.getContactEmail() != null) {
            validateEmail(request.getContactEmail());
        }
    }

    private void validateEmail(String email) {
        if (email != null && !email.trim().isEmpty()) {
            if (!EMAIL_PATTERN.matcher(email.trim()).matches()) {
                throw new BadRequestException("Invalid email format for department contact email.");
            }
        }
    }

    private String normalizeStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return "Active";
        }
        if ("Inactive".equalsIgnoreCase(status.trim())) {
            return "Inactive";
        }
        return "Active";
    }

    private DepartmentResponseDto mapToDto(Department department) {
        return DepartmentResponseDto.builder()
                .id(department.getId())
                .departmentId(department.getDepartmentId() != null ? department.getDepartmentId() : department.getId())
                .name(department.getName())
                .head(department.getHead())
                .doctorsCount(department.getDoctorsCount() != null ? department.getDoctorsCount() : 0)
                .staffCount(department.getStaffCount() != null ? department.getStaffCount() : 0)
                .location(department.getLocation())
                .status(department.getStatus() != null ? department.getStatus() : "Active")
                .description(department.getDescription())
                .contactEmail(department.getContactEmail())
                .contactPhone(department.getContactPhone())
                .branchId(department.getBranchId())
                .branchCode(department.getBranchCode())
                .createdAt(department.getCreatedAt())
                .updatedAt(department.getUpdatedAt())
                .build();
    }
}
