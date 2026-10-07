package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.dto.StaffRequestDto;
import lk.gamage.backend.healthbridgebackend.dto.StaffResponseDto;
import lk.gamage.backend.healthbridgebackend.dto.StaffStatsDto;
import lk.gamage.backend.healthbridgebackend.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class StaffController {

    private final StaffService staffService;

    @GetMapping
    public ResponseEntity<List<StaffResponseDto>> getAllStaff(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String dutyStatus,
            @RequestParam(required = false) String accountStatus,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(staffService.getAllStaff(department, dutyStatus, accountStatus, search));
    }

    @GetMapping("/stats")
    public ResponseEntity<StaffStatsDto> getStaffStats() {
        return ResponseEntity.ok(staffService.getStaffStats());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StaffResponseDto> getStaffById(@PathVariable String id) {
        return ResponseEntity.ok(staffService.getStaffById(id));
    }

    @PostMapping
    public ResponseEntity<StaffResponseDto> createStaff(@RequestBody StaffRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(staffService.createStaff(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StaffResponseDto> updateStaff(
            @PathVariable String id,
            @RequestBody StaffRequestDto request) {
        return ResponseEntity.ok(staffService.updateStaff(id, request));
    }

    @PatchMapping("/{id}/duty-status")
    public ResponseEntity<StaffResponseDto> updateDutyStatus(
            @PathVariable String id,
            @RequestParam String status) {
        return ResponseEntity.ok(staffService.updateDutyStatus(id, status));
    }

    @PatchMapping("/{id}/account-status")
    public ResponseEntity<StaffResponseDto> updateAccountStatus(
            @PathVariable String id,
            @RequestParam String status) {
        return ResponseEntity.ok(staffService.updateAccountStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable String id) {
        staffService.deleteStaff(id);
        return ResponseEntity.noContent().build();
    }
}
