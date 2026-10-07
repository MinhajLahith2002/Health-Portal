package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.SystemSettingDto;
import lk.gamage.backend.healthbridgebackend.model.SystemSetting;
import lk.gamage.backend.healthbridgebackend.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SystemSettingService {

    private final SystemSettingRepository repository;

    public SystemSetting createSystemSetting(SystemSettingDto dto) {
        if (repository.findBySettingKey(dto.getSettingKey()).isPresent()) {
            throw new RuntimeException("Setting already exists with key: " + dto.getSettingKey());
        }

        SystemSetting systemSetting = new SystemSetting();
        systemSetting.setCategory(dto.getCategory());
        systemSetting.setSettingKey(dto.getSettingKey());
        systemSetting.setSettingValue(dto.getSettingValue());
        systemSetting.setDescription(dto.getDescription());
        systemSetting.setCreatedAt(LocalDateTime.now());
        systemSetting.setUpdatedAt(LocalDateTime.now());
        systemSetting.setLastModifiedBy("SYSTEM_ADMIN");

        return repository.save(systemSetting);
    }

    public List<SystemSetting> getAllSystemSettings() {
        return repository.findAll();
    }

    public SystemSetting getSystemSetting(String settingKey) {
        return repository.findBySettingKey(settingKey)
                .orElseThrow(() -> new RuntimeException("Setting not found with key: " + settingKey));
    }

    public SystemSetting updateSystemSetting(String settingKey, SystemSettingDto dto) {
        SystemSetting systemSetting = getSystemSetting(settingKey);
        systemSetting.setSettingValue(dto.getSettingValue());
        systemSetting.setDescription(dto.getDescription());
        systemSetting.setUpdatedAt(LocalDateTime.now());
        systemSetting.setLastModifiedBy("SYSTEM_ADMIN");

        return repository.save(systemSetting);
    }

    public void resetToDefaultSystemSetting() {
        // Implement reset logic here. For example, delete all and re-seed, 
        // or update specific keys to default values.
        repository.deleteAll();
        
        // Basic defaults
        createSystemSetting(new SystemSettingDto("General", "system_name", "Health Bridge AI Healthcare System", "System Name"));
        createSystemSetting(new SystemSettingDto("General", "system_email", "admin@healthbridge.com", "System Email"));
        createSystemSetting(new SystemSettingDto("Regional", "time_zone", "(UTC+5:30) Asia/Colombo", "Time Zone"));
        createSystemSetting(new SystemSettingDto("Regional", "date_format", "DD/MM/YYYY", "Date Format"));
        createSystemSetting(new SystemSettingDto("Regional", "time_format", "24-Hour", "Time Format"));
        createSystemSetting(new SystemSettingDto("Regional", "language", "English", "Language"));
        createSystemSetting(new SystemSettingDto("Regional", "currency", "USD", "Currency"));
        createSystemSetting(new SystemSettingDto("Security", "tfa", "false", "Require 2FA"));
        createSystemSetting(new SystemSettingDto("Security", "session_timeout", "30", "Session Timeout"));
        createSystemSetting(new SystemSettingDto("Security", "password_expiry", "90", "Password Expiry"));
        createSystemSetting(new SystemSettingDto("Security", "max_login_attempts", "5", "Max Login Attempts"));
        createSystemSetting(new SystemSettingDto("Notifications", "email_alerts", "true", "Email Notifications"));
        createSystemSetting(new SystemSettingDto("Notifications", "sms_alerts", "true", "SMS Notifications"));
        createSystemSetting(new SystemSettingDto("Notifications", "push_alerts", "true", "Push Notifications"));
        createSystemSetting(new SystemSettingDto("Notifications", "appointment_reminders", "true", "Appointment Reminders"));
        createSystemSetting(new SystemSettingDto("Notifications", "prescription_refills", "true", "Prescription Refills"));
    }
}
