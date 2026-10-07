package lk.gamage.backend.healthbridgebackend.controller;

import jakarta.validation.Valid;
import lk.gamage.backend.healthbridgebackend.dto.SystemSettingDto;
import lk.gamage.backend.healthbridgebackend.model.SystemSetting;
import lk.gamage.backend.healthbridgebackend.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/system-settings")
@RequiredArgsConstructor
public class SystemSettingController {

    private final SystemSettingService systemSettingService;

    @PostMapping
    public ResponseEntity<SystemSetting> createSystemSetting(@Valid @RequestBody SystemSettingDto dto) {
        try {
            SystemSetting createdSetting = systemSettingService.createSystemSetting(dto);
            return new ResponseEntity<>(createdSetting, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<SystemSetting>> getAllSystemSettings() {
        return ResponseEntity.ok(systemSettingService.getAllSystemSettings());
    }

    @GetMapping("/{settingKey}")
    public ResponseEntity<SystemSetting> getSystemSetting(@PathVariable String settingKey) {
        try {
            return ResponseEntity.ok(systemSettingService.getSystemSetting(settingKey));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{settingKey}")
    public ResponseEntity<SystemSetting> updateSystemSetting(@PathVariable String settingKey,
            @Valid @RequestBody SystemSettingDto dto) {
        try {
            return ResponseEntity.ok(systemSettingService.updateSystemSetting(settingKey, dto));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/reset")
    public ResponseEntity<Void> resetToDefaultSystemSetting() {
        try {
            systemSettingService.resetToDefaultSystemSetting();
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
