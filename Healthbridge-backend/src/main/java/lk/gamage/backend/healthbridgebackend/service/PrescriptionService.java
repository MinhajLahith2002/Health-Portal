package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.request.CreatePrescriptionRequest;
import lk.gamage.backend.healthbridgebackend.dto.request.UpdatePrescriptionRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.DrugInteraction;
import lk.gamage.backend.healthbridgebackend.dto.response.PrescriptionResponse;

import java.util.List;

public interface PrescriptionService {

    PrescriptionResponse createPrescription(CreatePrescriptionRequest request);

    PrescriptionResponse updatePrescription(String id, UpdatePrescriptionRequest request);

    void deletePrescription(String id);

    PrescriptionResponse getPrescriptionById(String id);

    PrescriptionResponse getPrescriptionByNumber(String prescriptionNumber);

    List<PrescriptionResponse> getAllPrescriptions();

    List<PrescriptionResponse> getPrescriptionsByPatientId(String patientId);

    List<PrescriptionResponse> getPrescriptionsByDoctorId(String doctorId);

    List<PrescriptionResponse> getActivePrescriptionsByPatientId(String patientId);

    List<PrescriptionResponse> getActivePrescriptionsByDoctorId(String doctorId);

    List<DrugInteraction> checkDrugInteractions(List<String> medicineIds);

    String generateQRCode(String prescriptionNumber);

    byte[] generatePrescriptionPdf(String id);
}