package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.dto.*;
import lk.gamage.backend.healthbridgebackend.service.BedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/beds")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class BedController {

    private final BedService bedService;

    @GetMapping
    public ResponseEntity<List<BedResponseDto>> getAllBeds(
            @RequestParam(required = false) String ward,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(bedService.getAllBeds(ward, status, search));
    }

    @GetMapping("/stats")
    public ResponseEntity<BedStatsDto> getBedStats() {
        return ResponseEntity.ok(bedService.getBedStats());
    }

    @GetMapping("/occupancy")
    public ResponseEntity<List<DepartmentOccupancyDto>> getDepartmentOccupancy() {
        return ResponseEntity.ok(bedService.getDepartmentOccupancy());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BedResponseDto> getBedById(@PathVariable String id) {
        return ResponseEntity.ok(bedService.getBedById(id));
    }

    @PostMapping
    public ResponseEntity<BedResponseDto> createBed(@RequestBody BedRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bedService.createBed(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BedResponseDto> updateBed(
            @PathVariable String id,
            @RequestBody BedRequestDto request) {
        return ResponseEntity.ok(bedService.updateBed(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BedResponseDto> updateBedStatus(
            @PathVariable String id,
            @RequestParam String status) {
        return ResponseEntity.ok(bedService.updateBedStatus(id, status));
    }

    @PostMapping("/{id}/allocate")
    public ResponseEntity<BedResponseDto> allocateBed(
            @PathVariable String id,
            @RequestBody BedAllocationRequestDto request) {
        return ResponseEntity.ok(bedService.allocateBed(id, request));
    }

    @PostMapping("/{id}/transfer")
    public ResponseEntity<BedResponseDto> transferPatient(
            @PathVariable String id,
            @RequestBody BedTransferRequestDto request) {
        return ResponseEntity.ok(bedService.transferPatient(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBed(@PathVariable String id) {
        bedService.deleteBed(id);
        return ResponseEntity.noContent().build();
    }
}
