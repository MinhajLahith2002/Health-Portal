package lk.gamage.backend.healthbridgebackend.service.impl;

import lk.gamage.backend.healthbridgebackend.dto.response.MedicationReminderResponse;
import lk.gamage.backend.healthbridgebackend.model.MedicationReminder;
import lk.gamage.backend.healthbridgebackend.model.Prescription;
import lk.gamage.backend.healthbridgebackend.model.PrescriptionItem;
import lk.gamage.backend.healthbridgebackend.repository.MedicationReminderRepository;
import lk.gamage.backend.healthbridgebackend.service.MedicationReminderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicationReminderServiceImpl implements MedicationReminderService {

    @Autowired
    private MedicationReminderRepository reminderRepository;

    @Override
    public void generateRemindersForPrescription(Prescription prescription) {
        if (prescription.getItems() == null || prescription.getItems().isEmpty()) {
            return;
        }

        List<MedicationReminder> newReminders = new ArrayList<>();
        LocalDate startDate = LocalDate.now();

        for (PrescriptionItem item : prescription.getItems()) {
            int durationDays = parseDurationToDays(item.getDuration());

            for (int i = 0; i < durationDays; i++) {
                LocalDate currentDate = startDate.plusDays(i);
                List<LocalTime> times = determineTimesFromFrequency(item.getFrequency());

                for (LocalTime time : times) {
                    MedicationReminder reminder = MedicationReminder.builder()
                            .patientId(prescription.getPatientId())
                            .prescriptionId(prescription.getId())
                            .medicineName(item.getMedicineName())
                            .dosage(item.getDosage())
                            .instructions(item.getInstructions())
                            .scheduledDate(currentDate)
                            .scheduledTime(time)
                            .status("PENDING")
                            .build();
                    newReminders.add(reminder);
                }
            }
        }
        reminderRepository.saveAll(newReminders);
    }

    @Override
    public List<MedicationReminderResponse> getTodaysReminders(String patientId) {
        List<MedicationReminder> reminders = reminderRepository.findByPatientIdAndScheduledDateOrderByScheduledTimeAsc(patientId, LocalDate.now());
        
        return reminders.stream().map(reminder -> MedicationReminderResponse.builder()
                .id(reminder.getId())
                .prescriptionId(reminder.getPrescriptionId())
                .medicineName(reminder.getMedicineName())
                .dosage(reminder.getDosage())
                .instructions(reminder.getInstructions())
                .scheduledDate(reminder.getScheduledDate())
                .scheduledTime(reminder.getScheduledTime())
                .status(reminder.getStatus())
                .build()
        ).collect(Collectors.toList());
    }

    @Override
    public List<MedicationReminderResponse> getAllRemindersForTest(String patientId) {
        List<MedicationReminder> reminders = reminderRepository.findByPatientId(patientId);
        
        return reminders.stream().map(reminder -> MedicationReminderResponse.builder()
                .id(reminder.getId())
                .prescriptionId(reminder.getPrescriptionId())
                .medicineName(reminder.getMedicineName())
                .dosage(reminder.getDosage())
                .instructions(reminder.getInstructions())
                .scheduledDate(reminder.getScheduledDate())
                .scheduledTime(reminder.getScheduledTime())
                .status(reminder.getStatus())
                .build()
        ).collect(Collectors.toList());
    }

    @Override
    public MedicationReminderResponse updateReminderStatus(String reminderId, String status) {
        MedicationReminder reminder = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new RuntimeException("Reminder not found"));
        
        reminder.setStatus(status.toUpperCase()); 
        reminder.setActionTakenAt(LocalDateTime.now());
        MedicationReminder saved = reminderRepository.save(reminder);

        return MedicationReminderResponse.builder()
                .id(saved.getId())
                .medicineName(saved.getMedicineName())
                .status(saved.getStatus())
                .build();
    }

    private int parseDurationToDays(String durationStr) {
        if (durationStr == null || durationStr.trim().isEmpty()) {
            return 7; 
        }
        
        String upper = durationStr.toUpperCase().trim();
        try {
            String numberPart = upper.replaceAll("[^0-9]", "");
            if (numberPart.isEmpty()) return 7;
            
            int amount = Integer.parseInt(numberPart);
            
            if (upper.contains("YEAR")) {
                return amount * 365;
            } else if (upper.contains("MONTH")) {
                return amount * 30;
            } else if (upper.contains("WEEK")) {
                return amount * 7;
            } else {
                return amount;
            }
        } catch (Exception e) {
            return 7;
        }
    }

    private List<LocalTime> determineTimesFromFrequency(String frequency) {
        List<LocalTime> times = new ArrayList<>();
        if (frequency == null) {
            times.add(LocalTime.of(8, 0));
            return times;
        }
        String freqLower = frequency.toLowerCase();
        if (freqLower.contains("twice") || freqLower.contains("bid")) {
            times.add(LocalTime.of(8, 0));  
            times.add(LocalTime.of(20, 0)); 
        } else if (freqLower.contains("three") || freqLower.contains("tid")) {
            times.add(LocalTime.of(8, 0));  
            times.add(LocalTime.of(14, 0)); 
            times.add(LocalTime.of(20, 0)); 
        } else {
            times.add(LocalTime.of(8, 0));  
        }
        return times;
    }
}
