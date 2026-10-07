package lk.gamage.backend.healthbridgebackend.service.impl;

import lk.gamage.backend.healthbridgebackend.dto.StaffRequestDto;
import lk.gamage.backend.healthbridgebackend.dto.StaffResponseDto;
import lk.gamage.backend.healthbridgebackend.dto.StaffStatsDto;
import lk.gamage.backend.healthbridgebackend.exception.AlreadyExistsException;
import lk.gamage.backend.healthbridgebackend.exception.BadRequestException;
import lk.gamage.backend.healthbridgebackend.exception.ResourceNotFoundException;
import lk.gamage.backend.healthbridgebackend.model.Staff;
import lk.gamage.backend.healthbridgebackend.repository.StaffRepository;
import lk.gamage.backend.healthbridgebackend.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffServiceImpl implements StaffService {

    private final StaffRepository staffRepository;

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");

    @Override
    public List<StaffResponseDto> getAllStaff(String department, String dutyStatus, String accountStatus, String search) {
        List<Staff> staffList = staffRepository.findAll();

        if (department != null && !department.trim().isEmpty() && !"All".equalsIgnoreCase(department)) {
            staffList = staffList.stream()
                    .filter(s -> s.getDepartment() != null && s.getDepartment().equalsIgnoreCase(department.trim()))
                    .collect(Collectors.toList());
        }

        if (dutyStatus != null && !dutyStatus.trim().isEmpty() && !"All".equalsIgnoreCase(dutyStatus)) {
            staffList = staffList.stream()
                    .filter(s -> s.getDutyStatus() != null && s.getDutyStatus().equalsIgnoreCase(dutyStatus.trim()))
                    .collect(Collectors.toList());
        }

        if (accountStatus != null && !accountStatus.trim().isEmpty() && !"All".equalsIgnoreCase(accountStatus)) {
            staffList = staffList.stream()
                    .filter(s -> s.getAccountStatus() != null && s.getAccountStatus().equalsIgnoreCase(accountStatus.trim()))
                    .collect(Collectors.toList());
        }

        if (search != null && !search.trim().isEmpty()) {
            String lowerSearch = search.trim().toLowerCase();
            staffList = staffList.stream()
                    .filter(s -> (s.getFirstName() != null && s.getFirstName().toLowerCase().contains(lowerSearch)) ||
                            (s.getLastName() != null && s.getLastName().toLowerCase().contains(lowerSearch)) ||
                            (s.getStaffId() != null && s.getStaffId().toLowerCase().contains(lowerSearch)) ||
                            (s.getRole() != null && s.getRole().toLowerCase().contains(lowerSearch)) ||
                            (s.getDepartment() != null && s.getDepartment().toLowerCase().contains(lowerSearch)) ||
                            (s.getEmail() != null && s.getEmail().toLowerCase().contains(lowerSearch)))
                    .collect(Collectors.toList());
        }

        return staffList.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public StaffResponseDto getStaffById(String id) {
        Staff staff = findStaffEntity(id);
        return mapToDto(staff);
    }

    @Override
    public StaffResponseDto createStaff(StaffRequestDto request) {
        validateRequest(request, null);

        String staffId = request.getStaffId();
        if (staffId == null || staffId.trim().isEmpty()) {
            int randomNum = 1000 + new Random().nextInt(9000);
            staffId = "HB-" + randomNum;
            while (staffRepository.existsByStaffId(staffId)) {
                randomNum = 1000 + new Random().nextInt(9000);
                staffId = "HB-" + randomNum;
            }
        } else {
            if (staffRepository.existsByStaffId(staffId.trim())) {
                throw new AlreadyExistsException("Staff ID '" + staffId.trim() + "' is already in use.");
            }
        }

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            if (staffRepository.existsByEmailIgnoreCase(request.getEmail().trim())) {
                throw new AlreadyExistsException("Email '" + request.getEmail().trim() + "' is already registered.");
            }
        }

        String initials = request.getInitials();
        if ((initials == null || initials.trim().isEmpty()) && request.getFirstName() != null && request.getLastName() != null) {
            initials = (request.getFirstName().substring(0, 1) + request.getLastName().substring(0, 1)).toUpperCase();
        }

        Staff staff = Staff.builder()
                .staffId(staffId.trim())
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .role(request.getRole() != null ? request.getRole().trim() : "Staff Specialist")
                .department(request.getDepartment() != null ? request.getDepartment().trim() : "General Medical")
                .email(request.getEmail() != null ? request.getEmail().trim() : null)
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .extension(request.getExtension() != null ? request.getExtension().trim() : null)
                .dutyStatus(request.getDutyStatus() != null ? request.getDutyStatus().trim() : "Off Duty")
                .currentShift(request.getCurrentShift() != null ? request.getCurrentShift().trim() : "08:00 - 16:00")
                .avatarUrl(request.getAvatarUrl() != null ? request.getAvatarUrl().trim() : null)
                .initials(initials)
                .dob(request.getDob() != null ? request.getDob().trim() : null)
                .gender(request.getGender() != null ? request.getGender().trim() : null)
                .bloodGroup(request.getBloodGroup() != null ? request.getBloodGroup().trim() : null)
                .nationalId(request.getNationalId() != null ? request.getNationalId().trim() : null)
                .residentialAddress(request.getResidentialAddress() != null ? request.getResidentialAddress().trim() : null)
                .hireDate(request.getHireDate() != null ? request.getHireDate().trim() : LocalDateTime.now().toLocalDate().toString())
                .emergencyContactName(request.getEmergencyContactName() != null ? request.getEmergencyContactName().trim() : null)
                .emergencyContactRelation(request.getEmergencyContactRelation() != null ? request.getEmergencyContactRelation().trim() : null)
                .emergencyContactPhone(request.getEmergencyContactPhone() != null ? request.getEmergencyContactPhone().trim() : null)
                .locationFloor(request.getLocationFloor() != null ? request.getLocationFloor().trim() : null)
                .accountStatus(request.getAccountStatus() != null ? request.getAccountStatus().trim() : "Active")
                .branchId(request.getBranchId() != null ? request.getBranchId() : "BR-COL-01")
                .branchCode(request.getBranchCode() != null ? request.getBranchCode() : "BR-COL-01")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Staff saved = staffRepository.save(staff);
        return mapToDto(saved);
    }

    @Override
    public StaffResponseDto updateStaff(String id, StaffRequestDto request) {
        Staff staff = findStaffEntity(id);
        validateRequest(request, staff.getId());

        if (request.getFirstName() != null && !request.getFirstName().trim().isEmpty()) {
            staff.setFirstName(request.getFirstName().trim());
        }
        if (request.getLastName() != null && !request.getLastName().trim().isEmpty()) {
            staff.setLastName(request.getLastName().trim());
        }
        if (request.getRole() != null) {
            staff.setRole(request.getRole().trim());
        }
        if (request.getDepartment() != null) {
            staff.setDepartment(request.getDepartment().trim());
        }
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            String newEmail = request.getEmail().trim();
            if (staff.getEmail() == null || !newEmail.equalsIgnoreCase(staff.getEmail().trim())) {
                if (staffRepository.existsByEmailIgnoreCase(newEmail)) {
                    throw new AlreadyExistsException("Email '" + newEmail + "' is already registered to another staff member.");
                }
            }
            staff.setEmail(newEmail);
        }
        if (request.getPhone() != null) {
            staff.setPhone(request.getPhone().trim());
        }
        if (request.getExtension() != null) {
            staff.setExtension(request.getExtension().trim());
        }
        if (request.getDutyStatus() != null) {
            staff.setDutyStatus(request.getDutyStatus().trim());
        }
        if (request.getCurrentShift() != null) {
            staff.setCurrentShift(request.getCurrentShift().trim());
        }
        if (request.getAvatarUrl() != null) {
            staff.setAvatarUrl(request.getAvatarUrl().trim());
        }
        if (request.getInitials() != null) {
            staff.setInitials(request.getInitials().trim());
        } else if (staff.getFirstName() != null && staff.getLastName() != null) {
            staff.setInitials((staff.getFirstName().substring(0, 1) + staff.getLastName().substring(0, 1)).toUpperCase());
        }
        if (request.getDob() != null) {
            staff.setDob(request.getDob().trim());
        }
        if (request.getGender() != null) {
            staff.setGender(request.getGender().trim());
        }
        if (request.getBloodGroup() != null) {
            staff.setBloodGroup(request.getBloodGroup().trim());
        }
        if (request.getNationalId() != null) {
            staff.setNationalId(request.getNationalId().trim());
        }
        if (request.getResidentialAddress() != null) {
            staff.setResidentialAddress(request.getResidentialAddress().trim());
        }
        // Hire date is immutable after staff onboarding
        if (request.getEmergencyContactName() != null) {
            staff.setEmergencyContactName(request.getEmergencyContactName().trim());
        }
        if (request.getEmergencyContactRelation() != null) {
            staff.setEmergencyContactRelation(request.getEmergencyContactRelation().trim());
        }
        if (request.getEmergencyContactPhone() != null) {
            staff.setEmergencyContactPhone(request.getEmergencyContactPhone().trim());
        }
        if (request.getLocationFloor() != null) {
            staff.setLocationFloor(request.getLocationFloor().trim());
        }
        if (request.getAccountStatus() != null) {
            staff.setAccountStatus(request.getAccountStatus().trim());
        }

        staff.setUpdatedAt(LocalDateTime.now());
        Staff updated = staffRepository.save(staff);
        return mapToDto(updated);
    }

    @Override
    public StaffResponseDto updateDutyStatus(String id, String dutyStatus) {
        if (dutyStatus == null || dutyStatus.trim().isEmpty()) {
            throw new BadRequestException("Duty status is required.");
        }
        Staff staff = findStaffEntity(id);
        staff.setDutyStatus(dutyStatus.trim());
        staff.setUpdatedAt(LocalDateTime.now());
        Staff saved = staffRepository.save(staff);
        return mapToDto(saved);
    }

    @Override
    public StaffResponseDto updateAccountStatus(String id, String accountStatus) {
        if (accountStatus == null || accountStatus.trim().isEmpty()) {
            throw new BadRequestException("Account status is required.");
        }
        Staff staff = findStaffEntity(id);
        staff.setAccountStatus(accountStatus.trim());
        staff.setUpdatedAt(LocalDateTime.now());
        Staff saved = staffRepository.save(staff);
        return mapToDto(saved);
    }

    @Override
    public void deleteStaff(String id) {
        Staff staff = findStaffEntity(id);
        staffRepository.delete(staff);
    }

    @Override
    public StaffStatsDto getStaffStats() {
        List<Staff> allStaff = staffRepository.findAll();
        long totalActive = allStaff.stream()
                .filter(s -> s.getAccountStatus() == null || "Active".equalsIgnoreCase(s.getAccountStatus()))
                .count();

        long onDuty = allStaff.stream()
                .filter(s -> "On Duty".equalsIgnoreCase(s.getDutyStatus()))
                .count();

        long newThisMonth = allStaff.stream()
                .filter(s -> s.getCreatedAt() != null && s.getCreatedAt().isAfter(LocalDateTime.now().minusDays(30)))
                .count();

        long openShiftAlerts = allStaff.stream()
                .filter(s -> "Emergency Cover".equalsIgnoreCase(s.getDutyStatus()))
                .count();

        long pendingLeaveRequests = allStaff.stream()
                .filter(s -> "On Leave".equalsIgnoreCase(s.getDutyStatus()))
                .count();

        return StaffStatsDto.builder()
                .totalActiveStaff(totalActive > 0 ? totalActive : allStaff.size())
                .newThisMonth(newThisMonth)
                .onDutyCount(onDuty)
                .openShiftAlerts(openShiftAlerts)
                .pendingLeaveRequests(pendingLeaveRequests)
                .build();
    }

    private Staff findStaffEntity(String id) {
        return staffRepository.findById(id)
                .orElseGet(() -> staffRepository.findByStaffId(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Staff member not found with ID: " + id)));
    }

    private void validateRequest(StaffRequestDto request, String currentMongoId) {
        if (request == null) {
            throw new BadRequestException("Request body cannot be null.");
        }
        if (request.getFirstName() == null || request.getFirstName().trim().isEmpty()) {
            throw new BadRequestException("First name is required.");
        }
        if (request.getLastName() == null || request.getLastName().trim().isEmpty()) {
            throw new BadRequestException("Last name is required.");
        }
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            if (!EMAIL_PATTERN.matcher(request.getEmail().trim()).matches()) {
                throw new BadRequestException("Invalid email format.");
            }
        }
    }

    private StaffResponseDto mapToDto(Staff staff) {
        return StaffResponseDto.builder()
                .id(staff.getStaffId() != null ? staff.getStaffId() : staff.getId())
                .mongoId(staff.getId())
                .staffId(staff.getStaffId())
                .firstName(staff.getFirstName())
                .lastName(staff.getLastName())
                .role(staff.getRole())
                .department(staff.getDepartment())
                .email(staff.getEmail())
                .phone(staff.getPhone())
                .extension(staff.getExtension())
                .dutyStatus(staff.getDutyStatus())
                .currentShift(staff.getCurrentShift())
                .avatarUrl(staff.getAvatarUrl())
                .initials(staff.getInitials())
                .dob(staff.getDob())
                .gender(staff.getGender())
                .bloodGroup(staff.getBloodGroup())
                .nationalId(staff.getNationalId())
                .residentialAddress(staff.getResidentialAddress())
                .hireDate(staff.getHireDate())
                .emergencyContactName(staff.getEmergencyContactName())
                .emergencyContactRelation(staff.getEmergencyContactRelation())
                .emergencyContactPhone(staff.getEmergencyContactPhone())
                .locationFloor(staff.getLocationFloor())
                .accountStatus(staff.getAccountStatus() != null ? staff.getAccountStatus() : "Active")
                .branchId(staff.getBranchId())
                .branchCode(staff.getBranchCode())
                .createdAt(staff.getCreatedAt())
                .updatedAt(staff.getUpdatedAt())
                .build();
    }
}
