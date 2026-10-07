package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.dto.response.MedicationReminderResponse;
import lk.gamage.backend.healthbridgebackend.service.MedicationReminderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reminders")
public class MedicationReminderController {

    @Autowired
    private MedicationReminderService reminderService;

    @GetMapping("/today/{patientId}")
    public ResponseEntity<List<MedicationReminderResponse>> getTodaysReminders(@PathVariable String patientId) {
        return ResponseEntity.ok(reminderService.getTodaysReminders(patientId));
    }

    @PutMapping("/{reminderId}/status")
    public ResponseEntity<MedicationReminderResponse> updateReminderStatus(
            @PathVariable String reminderId, 
            @RequestParam String status) {
        return ResponseEntity.ok(reminderService.updateReminderStatus(reminderId, status));
    }

    @GetMapping("/all/{patientId}")
    public ResponseEntity<List<MedicationReminderResponse>> getAllReminders(@PathVariable String patientId) {
        return ResponseEntity.ok(reminderService.getAllRemindersForTest(patientId));
    }

    @Autowired
    private org.springframework.data.mongodb.core.MongoTemplate mongoTemplate;

    @GetMapping("/raw")
    public ResponseEntity<List<org.bson.Document>> getRaw() {
        return ResponseEntity.ok(mongoTemplate.findAll(org.bson.Document.class, "medication_reminders"));
    }
}
