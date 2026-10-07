package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.PermissionDto;
import lk.gamage.backend.healthbridgebackend.model.Permission;
import lk.gamage.backend.healthbridgebackend.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PermissionService {

    private final PermissionRepository repository;

    public Permission createPermission(PermissionDto dto) {
        if (repository.findByModuleName(dto.getModuleName()).isPresent()) {
            throw new RuntimeException("Permission for this module already exists.");
        }

        Permission permission = new Permission();
        permission.setModuleName(dto.getModuleName());
        permission.setCanView(dto.isCanView());
        permission.setCanCreate(dto.isCanCreate());
        permission.setCanEdit(dto.isCanEdit());
        permission.setCanDelete(dto.isCanDelete());
        permission.setCanApprove(dto.isCanApprove());
        permission.setCanExport(dto.isCanExport());
        permission.setCanManage(dto.isCanManage());

        return repository.save(permission);
    }

    public List<Permission> getAllPermissions() {
        return repository.findAll();
    }

    public Permission updatePermission(String id, PermissionDto dto) {
        Permission permission = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Permission not found with ID: " + id));

        permission.setModuleName(dto.getModuleName());
        permission.setCanView(dto.isCanView());
        permission.setCanCreate(dto.isCanCreate());
        permission.setCanEdit(dto.isCanEdit());
        permission.setCanDelete(dto.isCanDelete());
        permission.setCanApprove(dto.isCanApprove());
        permission.setCanExport(dto.isCanExport());
        permission.setCanManage(dto.isCanManage());

        return repository.save(permission);
    }
}
