package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.dto.DepartmentRequestDto;
import lk.gamage.backend.healthbridgebackend.dto.DepartmentResponseDto;
import lk.gamage.backend.healthbridgebackend.dto.DepartmentStatsDto;
import lk.gamage.backend.healthbridgebackend.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    public ResponseEntity<List<DepartmentResponseDto>> getAllDepartments(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(departmentService.getAllDepartments(status, search));
    }

    @GetMapping("/stats")
    public ResponseEntity<DepartmentStatsDto> getDepartmentStats() {
        return ResponseEntity.ok(departmentService.getDepartmentStats());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepartmentResponseDto> getDepartmentById(@PathVariable String id) {
        return ResponseEntity.ok(departmentService.getDepartmentById(id));
    }

    @PostMapping
    public ResponseEntity<DepartmentResponseDto> createDepartment(
            @RequestBody DepartmentRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(departmentService.createDepartment(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DepartmentResponseDto> updateDepartment(
            @PathVariable String id,
            @RequestBody DepartmentRequestDto request) {
        return ResponseEntity.ok(departmentService.updateDepartment(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<DepartmentResponseDto> updateDepartmentStatus(
            @PathVariable String id,
            @RequestParam String status) {
        return ResponseEntity.ok(departmentService.updateDepartmentStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable String id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }
}
