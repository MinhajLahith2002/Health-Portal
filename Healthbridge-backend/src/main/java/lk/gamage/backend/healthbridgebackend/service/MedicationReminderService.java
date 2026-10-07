package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.response.MedicationReminderResponse;
import lk.gamage.backend.healthbridgebackend.model.Prescription;

import java.util.List;

public interface MedicationReminderService {
    void generateRemindersForPrescription(Prescription prescription);
    List<MedicationReminderResponse> getTodaysReminders(String patientId);
    List<MedicationReminderResponse> getAllRemindersForTest(String patientId);
    MedicationReminderResponse updateReminderStatus(String reminderId, String status);
}
