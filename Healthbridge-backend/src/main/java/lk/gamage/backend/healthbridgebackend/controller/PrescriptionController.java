package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.dto.request.CreatePrescriptionRequest;
import lk.gamage.backend.healthbridgebackend.dto.request.UpdatePrescriptionRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.DrugInteraction;
import lk.gamage.backend.healthbridgebackend.dto.response.PrescriptionResponse;
import lk.gamage.backend.healthbridgebackend.service.PrescriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    @Autowired
    private PrescriptionService prescriptionService;

    // 1. Create Prescription
    @PostMapping
    public ResponseEntity<PrescriptionResponse> createPrescription(
            @Valid @RequestBody CreatePrescriptionRequest request) {
        PrescriptionResponse response = prescriptionService.createPrescription(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 2. Update Prescription
    @PutMapping("/{id}")
    public ResponseEntity<PrescriptionResponse> updatePrescription(
            @PathVariable String id,
            @Valid @RequestBody UpdatePrescriptionRequest request) {
        PrescriptionResponse response = prescriptionService.updatePrescription(id, request);
        return ResponseEntity.ok(response);
    }

    // 3. Delete Prescription
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePrescription(@PathVariable String id) {
        prescriptionService.deletePrescription(id);
        return ResponseEntity.noContent().build();
    }

    // 4. Get Prescription by ID
    @GetMapping("/{id}")
    public ResponseEntity<PrescriptionResponse> getPrescriptionById(@PathVariable String id) {
        PrescriptionResponse response = prescriptionService.getPrescriptionById(id);
        return ResponseEntity.ok(response);
    }

    // 5. Get Prescription by Number
    @GetMapping("/number/{prescriptionNumber}")
    public ResponseEntity<PrescriptionResponse> getPrescriptionByNumber(
            @PathVariable String prescriptionNumber) {
        PrescriptionResponse response = prescriptionService.getPrescriptionByNumber(prescriptionNumber);
        return ResponseEntity.ok(response);
    }

    // 6. Get All Prescriptions
    @GetMapping
    public ResponseEntity<List<PrescriptionResponse>> getAllPrescriptions() {
        List<PrescriptionResponse> responses = prescriptionService.getAllPrescriptions();
        return ResponseEntity.ok(responses);
    }

    // 7. Get Prescriptions by Patient ID
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<PrescriptionResponse>> getPrescriptionsByPatientId(
            @PathVariable String patientId) {
        List<PrescriptionResponse> responses = prescriptionService.getPrescriptionsByPatientId(patientId);
        return ResponseEntity.ok(responses);
    }

    // 8. Get Prescriptions by Doctor ID
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<PrescriptionResponse>> getPrescriptionsByDoctorId(
            @PathVariable String doctorId) {
        List<PrescriptionResponse> responses = prescriptionService.getPrescriptionsByDoctorId(doctorId);
        return ResponseEntity.ok(responses);
    }

    // 9. Get Active Prescriptions by Patient ID
    @GetMapping("/patient/{patientId}/active")
    public ResponseEntity<List<PrescriptionResponse>> getActivePrescriptionsByPatientId(
            @PathVariable String patientId) {
        List<PrescriptionResponse> responses = prescriptionService.getActivePrescriptionsByPatientId(patientId);
        return ResponseEntity.ok(responses);
    }

    // 10. Get Active Prescriptions by Doctor ID
    @GetMapping("/doctor/{doctorId}/active")
    public ResponseEntity<List<PrescriptionResponse>> getActivePrescriptionsByDoctorId(
            @PathVariable String doctorId) {
        List<PrescriptionResponse> responses = prescriptionService.getActivePrescriptionsByDoctorId(doctorId);
        return ResponseEntity.ok(responses);
    }

    // 11. Check Drug Interactions
    @PostMapping("/check-interactions")
    public ResponseEntity<List<DrugInteraction>> checkDrugInteractions(
            @RequestBody List<String> medicineIds) {
        List<DrugInteraction> interactions = prescriptionService.checkDrugInteractions(medicineIds);
        return ResponseEntity.ok(interactions);
    }

    // 12. Get QR Code Data
    @GetMapping("/{id}/qr-code")
    public ResponseEntity<Map<String, String>> getQRCode(@PathVariable String id) {
        PrescriptionResponse prescription = prescriptionService.getPrescriptionById(id);
        Map<String, String> qrData = new HashMap<>();
        qrData.put("prescriptionNumber", prescription.getPrescriptionNumber());
        qrData.put("qrCodeData", prescription.getQrCodeData());
        return ResponseEntity.ok(qrData);
    }

    // 13. Download Prescription PDF
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadPrescriptionPdf(@PathVariable String id) {
        byte[] pdf = prescriptionService.generatePrescriptionPdf(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"prescription-" + id + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}