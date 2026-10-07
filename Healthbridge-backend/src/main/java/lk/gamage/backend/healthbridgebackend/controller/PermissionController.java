package lk.gamage.backend.healthbridgebackend.controller;

import jakarta.validation.Valid;
import lk.gamage.backend.healthbridgebackend.dto.PermissionDto;
import lk.gamage.backend.healthbridgebackend.model.Permission;
import lk.gamage.backend.healthbridgebackend.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    @PostMapping
    public ResponseEntity<Permission> createPermission(@Valid @RequestBody PermissionDto permissionDto) {
        try {
            Permission createdPermission = permissionService.createPermission(permissionDto);
            return new ResponseEntity<>(createdPermission, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Permission>> getAllPermissions() {
        return ResponseEntity.ok(permissionService.getAllPermissions());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Permission> updatePermission(@PathVariable String id,
            @Valid @RequestBody PermissionDto permissionDto) {
        try {
            Permission updatedPermission = permissionService.updatePermission(id, permissionDto);
            return ResponseEntity.ok(updatedPermission);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
