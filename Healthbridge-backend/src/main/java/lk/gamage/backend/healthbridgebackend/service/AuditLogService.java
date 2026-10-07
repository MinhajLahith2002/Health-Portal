package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.AuditLogDto;
import lk.gamage.backend.healthbridgebackend.model.AuditLog;
import lk.gamage.backend.healthbridgebackend.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.io.ByteArrayOutputStream;
import com.itextpdf.text.Document;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfWriter;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository repository;

    public AuditLog logAction(AuditLogDto dto) {
        AuditLog auditLog = new AuditLog();
        auditLog.setUser(dto.getUser());
        auditLog.setRole(dto.getRole());
        auditLog.setEvent(dto.getEvent());
        auditLog.setModule(dto.getModule());
        auditLog.setActionDetails(dto.getActionDetails());
        auditLog.setRefId(dto.getRefId());
        auditLog.setIpDevice(dto.getIpDevice());
        auditLog.setStatus(dto.getStatus());
        auditLog.setSeverity(dto.getSeverity());
        auditLog.setTimestamp(LocalDateTime.now());
        
        return repository.save(auditLog);
    }

    public List<AuditLog> getAllLogs() {
        return repository.findAll();
    }

    public List<AuditLog> getLogsByRole(String role) {
        return repository.findByRole(role);
    }

    public List<AuditLog> getLogsByEvent(String event) {
        return repository.findByEvent(event);
    }

    public List<AuditLog> getLogsBySeverity(String severity) {
        return repository.findBySeverity(severity);
    }

    public java.util.Map<String, Long> getTodaySummary() {
        LocalDateTime startOfDay = LocalDateTime.now().with(java.time.LocalTime.MIN);
        List<AuditLog> todayLogs = repository.findAll().stream()
                .filter(log -> log.getTimestamp() != null && log.getTimestamp().isAfter(startOfDay))
                .toList();

        long totalToday = todayLogs.size();
        long authEvents = todayLogs.stream().filter(log -> "Authentication".equals(log.getModule())).count();
        long adminActions = todayLogs.stream().filter(log -> "Super Admin".equals(log.getRole()) || "Admin".equals(log.getRole())).count();
        long recordAccess = todayLogs.stream().filter(log -> log.getEvent() != null && log.getEvent().contains("Access")).count();
        long securityEvents = todayLogs.stream().filter(log -> "High".equals(log.getSeverity())).count();
        long failedActions = todayLogs.stream().filter(log -> "Failed".equals(log.getStatus())).count();

        return java.util.Map.of(
            "totalToday", totalToday,
            "authEvents", authEvents,
            "adminActions", adminActions,
            "recordAccess", recordAccess,
            "securityEvents", securityEvents,
            "failedActions", failedActions
        );
    }

    public byte[] generateAuditReport() {
        try {
            List<AuditLog> logs = repository.findAll();
            Document document = new Document();
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, out);
            
            document.open();
            document.add(new Paragraph("HealthBridge - Audit Logs Report"));
            document.add(new Paragraph("Generated on: " + LocalDateTime.now().toString()));
            document.add(new Paragraph("Total Logs: " + logs.size()));
            document.add(new Paragraph("--------------------------------------------------"));
            
            for (int i = 0; i < Math.min(logs.size(), 100); i++) {
                AuditLog log = logs.get(i);
                document.add(new Paragraph(String.format("[%s] %s (%s) - %s: %s [%s]", 
                    log.getTimestamp(), log.getUser(), log.getRole(), log.getEvent(), log.getActionDetails(), log.getSeverity())));
            }
            if (logs.size() > 100) {
                document.add(new Paragraph("... and " + (logs.size() - 100) + " more logs."));
            }
            
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            e.printStackTrace();
            return new byte[0];
        }
    }
}
