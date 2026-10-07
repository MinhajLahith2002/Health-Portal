package lk.gamage.backend.healthbridgebackend.controller;

import jakarta.validation.Valid;
import lk.gamage.backend.healthbridgebackend.dto.AuditLogDto;
import lk.gamage.backend.healthbridgebackend.model.AuditLog;
import lk.gamage.backend.healthbridgebackend.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @PostMapping
    public ResponseEntity<AuditLog> logAction(@Valid @RequestBody AuditLogDto auditLogDto) {
        try {
            AuditLog createdLog = auditLogService.logAction(auditLogDto);
            return new ResponseEntity<>(createdLog, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<AuditLog>> getAllLogs() {
        return ResponseEntity.ok(auditLogService.getAllLogs());
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<AuditLog>> getLogsByRole(@PathVariable String role) {
        return ResponseEntity.ok(auditLogService.getLogsByRole(role));
    }

    @GetMapping("/event/{event}")
    public ResponseEntity<List<AuditLog>> getLogsByEvent(@PathVariable String event) {
        return ResponseEntity.ok(auditLogService.getLogsByEvent(event));
    }

    @GetMapping("/severity/{severity}")
    public ResponseEntity<List<AuditLog>> getLogsBySeverity(@PathVariable String severity) {
        return ResponseEntity.ok(auditLogService.getLogsBySeverity(severity));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Long>> getTodaySummary() {
        return ResponseEntity.ok(auditLogService.getTodaySummary());
    }

    @GetMapping(value = "/report", produces = org.springframework.http.MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getAuditReport() {
        return ResponseEntity.ok(auditLogService.generateAuditReport());
    }
}
