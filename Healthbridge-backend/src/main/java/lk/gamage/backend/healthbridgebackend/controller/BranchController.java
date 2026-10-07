package lk.gamage.backend.healthbridgebackend.controller;

import jakarta.validation.Valid;
import lk.gamage.backend.healthbridgebackend.dto.BranchRequestDto;
import lk.gamage.backend.healthbridgebackend.dto.BranchResponseDto;
import lk.gamage.backend.healthbridgebackend.service.BranchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/branches")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class BranchController {

    private final BranchService branchService;

    @GetMapping
    public ResponseEntity<List<BranchResponseDto>> getAllBranches() {
        log.info("📥 GET /api/branches - Fetching all hospital branches");
        return ResponseEntity.ok(branchService.getAllBranches());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BranchResponseDto> getBranchById(@PathVariable String id) {
        log.info("📥 GET /api/branches/{} - Fetching branch", id);
        return ResponseEntity.ok(branchService.getBranchById(id));
    }

    @PostMapping
    public ResponseEntity<BranchResponseDto> createBranch(@Valid @RequestBody BranchRequestDto request) {
        log.info("📥 POST /api/branches - Creating branch: {}", request.getBranchCode());
        BranchResponseDto created = branchService.createBranch(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BranchResponseDto> updateBranch(
            @PathVariable String id,
            @RequestBody BranchRequestDto request) {
        log.info("📥 PUT /api/branches/{} - Updating branch", id);
        return ResponseEntity.ok(branchService.updateBranch(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBranch(@PathVariable String id) {
        log.info("📥 DELETE /api/branches/{} - Deleting branch", id);
        branchService.deleteBranch(id);
        return ResponseEntity.noContent().build();
    }
}
