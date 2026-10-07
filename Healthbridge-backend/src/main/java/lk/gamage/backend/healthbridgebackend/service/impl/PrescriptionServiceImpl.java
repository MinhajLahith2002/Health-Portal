package lk.gamage.backend.healthbridgebackend.service.impl;

import lk.gamage.backend.healthbridgebackend.dto.request.CreatePrescriptionRequest;
import lk.gamage.backend.healthbridgebackend.dto.request.UpdatePrescriptionRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.DrugInteraction;
import lk.gamage.backend.healthbridgebackend.dto.response.PrescriptionResponse;
import lk.gamage.backend.healthbridgebackend.exception.ResourceNotFoundException;
import lk.gamage.backend.healthbridgebackend.model.Medicine;
import lk.gamage.backend.healthbridgebackend.model.Prescription;
import lk.gamage.backend.healthbridgebackend.model.PrescriptionItem;
import lk.gamage.backend.healthbridgebackend.repository.MedicineRepository;
import lk.gamage.backend.healthbridgebackend.repository.PrescriptionRepository;
import lk.gamage.backend.healthbridgebackend.service.PrescriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.itextpdf.text.Document;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Image;
import com.itextpdf.text.Element;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.text.pdf.BarcodeQRCode;
import java.io.ByteArrayOutputStream;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PrescriptionServiceImpl implements PrescriptionService {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private MedicineRepository medicineRepository; // ✅ Fixed: Using Repository instead of Service

    // --- DEVELOPER 03/17: MEDICATION REMINDERS ---
    // Please do not remove. This service automatically creates patient reminders when a prescription is issued.
    @Autowired
    private lk.gamage.backend.healthbridgebackend.service.MedicationReminderService medicationReminderService;
    // ---------------------------------------------

    @Override
    public PrescriptionResponse createPrescription(CreatePrescriptionRequest request) {
        // Generate unique prescription number
        String prescriptionNumber = generatePrescriptionNumber();

        // Map items
        List<PrescriptionItem> items = request.getItems().stream()
                .map(item -> PrescriptionItem.builder()
                        .medicineId(item.getMedicineId())
                        .medicineName(item.getMedicineName())
                        .dosage(item.getDosage())
                        .frequency(item.getFrequency())
                        .duration(item.getDuration())
                        .quantity(item.getQuantity())
                        .instructions(item.getInstructions())
                        .build())
                .collect(Collectors.toList());

        // Calculate valid until date
        LocalDateTime validUntil = LocalDateTime.now().plusDays(request.getValidDays());

        // Create prescription
        Prescription prescription = Prescription.builder()
                .prescriptionNumber(prescriptionNumber)
                .patientId(request.getPatientId())
                .patientName(request.getPatientName())
                .patientPhone(request.getPatientPhone())
                .doctorId(request.getDoctorId())
                .doctorName(request.getDoctorName())
                .items(items)
                .notes(request.getNotes())
                .diagnosis(request.getDiagnosis())
                .validUntil(validUntil)
                .status("ACTIVE")
                .qrCodeData(generateQRCode(prescriptionNumber))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Prescription savedPrescription = prescriptionRepository.save(prescription);

        // --- DEVELOPER 03/17: MEDICATION REMINDERS ---
        // Generates daily reminders for the patient dashboard.
        // Wrapped in try-catch to guarantee that if reminders fail, the prescription STILL SAVES successfully.
        try {
            medicationReminderService.generateRemindersForPrescription(savedPrescription);
        } catch (Exception e) {
            System.err.println("Warning: Prescription saved, but automated reminders failed to generate - " + e.getMessage());
        }
        // ---------------------------------------------

        return mapToResponse(savedPrescription);
    }

    @Override
    public PrescriptionResponse updatePrescription(String id, UpdatePrescriptionRequest request) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with id: " + id));

        // Update items if provided
        if (request.getItems() != null) {
            List<PrescriptionItem> items = request.getItems().stream()
                    .map(item -> PrescriptionItem.builder()
                            .medicineId(item.getMedicineId())
                            .medicineName(item.getMedicineName())
                            .dosage(item.getDosage())
                            .frequency(item.getFrequency())
                            .duration(item.getDuration())
                            .quantity(item.getQuantity())
                            .instructions(item.getInstructions())
                            .build())
                    .collect(Collectors.toList());
            prescription.setItems(items);
        }

        // Update other fields
        if (request.getNotes() != null) {
            prescription.setNotes(request.getNotes());
        }
        if (request.getDiagnosis() != null) {
            prescription.setDiagnosis(request.getDiagnosis());
        }
        if (request.getStatus() != null) {
            prescription.setStatus(request.getStatus());
        }

        prescription.setUpdatedAt(LocalDateTime.now());

        Prescription updatedPrescription = prescriptionRepository.save(prescription);
        return mapToResponse(updatedPrescription);
    }

    @Override
    public void deletePrescription(String id) {
        if (!prescriptionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Prescription not found with id: " + id);
        }
        prescriptionRepository.deleteById(id);
    }

    @Override
    public PrescriptionResponse getPrescriptionById(String id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with id: " + id));
        return mapToResponse(prescription);
    }

    @Override
    public PrescriptionResponse getPrescriptionByNumber(String prescriptionNumber) {
        Prescription prescription = prescriptionRepository.findByPrescriptionNumber(prescriptionNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with number: " + prescriptionNumber));
        return mapToResponse(prescription);
    }

    @Override
    public List<PrescriptionResponse> getAllPrescriptions() {
        return prescriptionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PrescriptionResponse> getPrescriptionsByPatientId(String patientId) {
        return prescriptionRepository.findByPatientId(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PrescriptionResponse> getPrescriptionsByDoctorId(String doctorId) {
        return prescriptionRepository.findByDoctorId(doctorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PrescriptionResponse> getActivePrescriptionsByPatientId(String patientId) {
        return prescriptionRepository.findByPatientIdAndStatus(patientId, "ACTIVE").stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PrescriptionResponse> getActivePrescriptionsByDoctorId(String doctorId) {
        return prescriptionRepository.findByDoctorIdAndStatus(doctorId, "ACTIVE").stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<DrugInteraction> checkDrugInteractions(List<String> medicineIds) {
        List<DrugInteraction> interactions = new ArrayList<>();

        // ✅ Fixed: Using medicineRepository instead of medicineService
        List<Medicine> medicines = medicineIds.stream()
                .map(id -> medicineRepository.findById(id).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        // Check interactions between each pair
        for (int i = 0; i < medicines.size(); i++) {
            for (int j = i + 1; j < medicines.size(); j++) {
                Medicine med1 = medicines.get(i);
                Medicine med2 = medicines.get(j);

                // Check if med1 interacts with med2
                if (med1.getSubstituteMedicineCodes() != null &&
                        med1.getSubstituteMedicineCodes().contains(med2.getMedicineCode())) {
                    interactions.add(DrugInteraction.builder()
                            .medicine1(med1.getName())
                            .medicine2(med2.getName())
                            .severity("MODERATE")
                            .description("Potential interaction between " + med1.getName() + " and " + med2.getName())
                            .build());
                }
            }
        }

        return interactions;
    }

    @Override
    public String generateQRCode(String prescriptionNumber) {
        // Simple QR code data - in production, use a QR code library
        return "PRESCRIPTION:" + prescriptionNumber + ":HEALTHBRIDGE";
    }

    // Helper method to generate unique prescription number
    private String generatePrescriptionNumber() {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String random = String.valueOf((int)(Math.random() * 10000));
        return "RX-" + timestamp.substring(timestamp.length() - 8) + "-" + random;
    }

    // Helper method to map Prescription to PrescriptionResponse
    private PrescriptionResponse mapToResponse(Prescription prescription) {
        List<lk.gamage.backend.healthbridgebackend.dto.response.PrescriptionItemResponse> itemResponses =
                prescription.getItems().stream()
                        .map(item -> lk.gamage.backend.healthbridgebackend.dto.response.PrescriptionItemResponse.builder()
                                .medicineId(item.getMedicineId())
                                .medicineName(item.getMedicineName())
                                .dosage(item.getDosage())
                                .frequency(item.getFrequency())
                                .duration(item.getDuration())
                                .quantity(item.getQuantity())
                                .instructions(item.getInstructions())
                                .build())
                        .collect(Collectors.toList());

        return PrescriptionResponse.builder()
                .id(prescription.getId())
                .prescriptionNumber(prescription.getPrescriptionNumber())
                .patientId(prescription.getPatientId())
                .patientName(prescription.getPatientName())
                .patientPhone(prescription.getPatientPhone())
                .doctorId(prescription.getDoctorId())
                .doctorName(prescription.getDoctorName())
                .items(itemResponses)
                .notes(prescription.getNotes())
                .diagnosis(prescription.getDiagnosis())
                .validUntil(prescription.getValidUntil())
                .status(prescription.getStatus())
                .qrCodeData(prescription.getQrCodeData())
                .createdAt(prescription.getCreatedAt())
                .updatedAt(prescription.getUpdatedAt())
                .build();
    }

    @Override
    public byte[] generatePrescriptionPdf(String id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with id: " + id));

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            // Header
            com.itextpdf.text.Font titleFont = new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 18, com.itextpdf.text.Font.BOLD);
            document.add(new Paragraph("OFFICIAL PRESCRIPTION", titleFont));
            document.add(new Paragraph(" "));

            // ✅ ADDED: Patient and Doctor Details
            document.add(new Paragraph("Patient Name: " + (prescription.getPatientName() != null ? prescription.getPatientName() : "N/A")));
            document.add(new Paragraph("Doctor Name: " + (prescription.getDoctorName() != null ? prescription.getDoctorName() : "N/A")));
            document.add(new Paragraph("Prescription Number: " + prescription.getPrescriptionNumber()));
            document.add(new Paragraph("Date Issued: " + prescription.getCreatedAt()));
            document.add(new Paragraph("Valid Until: " + prescription.getValidUntil()));
            document.add(new Paragraph("--------------------------------------------------"));

            // QR Code (Right aligned)
            String qrData = prescription.getQrCodeData() != null ? prescription.getQrCodeData() : prescription.getPrescriptionNumber();
            BarcodeQRCode qrCode = new BarcodeQRCode(qrData, 128, 128, null);
            Image qrCodeImage = qrCode.getImage();
            qrCodeImage.setAlignment(Element.ALIGN_RIGHT);
            qrCodeImage.setSpacingBefore(10f);
            qrCodeImage.setSpacingAfter(10f);
            document.add(qrCodeImage);

            document.add(new Paragraph(" "));
            com.itextpdf.text.Font sectionFont = new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 12, com.itextpdf.text.Font.BOLD);
            document.add(new Paragraph("Medicines:", sectionFont));

            for (PrescriptionItem item : prescription.getItems()) {
                document.add(new Paragraph("• " + item.getMedicineName() + " - " + item.getDosage() + " (" + item.getFrequency() + ")"));
                document.add(new Paragraph("  Duration: " + item.getDuration() + " | Qty: " + item.getQuantity()));
                document.add(new Paragraph("  Instructions: " + item.getInstructions()));
                document.add(new Paragraph(" "));
            }

            if (prescription.getNotes() != null && !prescription.getNotes().isEmpty()) {
                document.add(new Paragraph("Doctor's Notes: " + prescription.getNotes()));
            }

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }
}