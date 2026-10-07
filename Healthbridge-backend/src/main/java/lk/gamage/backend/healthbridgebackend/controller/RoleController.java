package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.dto.RoleDto;
import lk.gamage.backend.healthbridgebackend.model.Role;
import lk.gamage.backend.healthbridgebackend.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @PostMapping
    public ResponseEntity<Role> createRole(@Valid @RequestBody RoleDto roleDto) {
        try {
            Role createdRole = roleService.createRole(roleDto);
            return new ResponseEntity<>(createdRole, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Role>> getAllRoles() {
        return ResponseEntity.ok(roleService.getAllRoles());
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Role>> getRolesByType(@PathVariable String type) {
        return ResponseEntity.ok(roleService.getRolesByType(type));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Role> updateRole(@PathVariable String id, @Valid @RequestBody RoleDto roleDto) {
        try {
            Role updatedRole = roleService.updateRole(id, roleDto);
            return ResponseEntity.ok(updatedRole);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Long>> getRoleSummary() {
        return ResponseEntity.ok(roleService.getRoleSummary());
    }
}
