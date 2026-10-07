package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.dto.EquipmentRequestDto;
import lk.gamage.backend.healthbridgebackend.dto.EquipmentResponseDto;
import lk.gamage.backend.healthbridgebackend.dto.EquipmentStatsDto;
import lk.gamage.backend.healthbridgebackend.service.EquipmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class EquipmentController {

    @Autowired
    private EquipmentService equipmentService;

    @GetMapping
    public ResponseEntity<List<EquipmentResponseDto>> getAllEquipment(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(equipmentService.getAllEquipment(category, department, status, search));
    }

    @GetMapping("/stats")
    public ResponseEntity<EquipmentStatsDto> getEquipmentStats() {
        return ResponseEntity.ok(equipmentService.getEquipmentStats());
    }

    @GetMapping("/locations")
    public ResponseEntity<List<String>> getLocationsByDepartment(@RequestParam(required = false) String department) {
        return ResponseEntity.ok(equipmentService.getLocationsByDepartment(department));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipmentResponseDto> getEquipmentById(@PathVariable String id) {
        return ResponseEntity.ok(equipmentService.getEquipmentById(id));
    }

    @PostMapping
    public ResponseEntity<EquipmentResponseDto> createEquipment(@RequestBody EquipmentRequestDto request) {
        return new ResponseEntity<>(equipmentService.createEquipment(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EquipmentResponseDto> updateEquipment(@PathVariable String id, @RequestBody EquipmentRequestDto request) {
        return ResponseEntity.ok(equipmentService.updateEquipment(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<EquipmentResponseDto> updateEquipmentStatus(@PathVariable String id, @RequestParam String status) {
        return ResponseEntity.ok(equipmentService.updateEquipmentStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEquipment(@PathVariable String id) {
        equipmentService.deleteEquipment(id);
        return ResponseEntity.noContent().build();
    }
}
