package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.request.InvoiceRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.InvoiceResponse;

import java.util.List;

public interface InvoiceService {

    // ============================================================
    // CRUD Operations
    // ============================================================
    InvoiceResponse createInvoice(InvoiceRequest request);

    List<InvoiceResponse> getAllInvoices();

    InvoiceResponse getInvoice(String id);

    List<InvoiceResponse> getPatientInvoices(String patientId);

    InvoiceResponse updateInvoice(String id, InvoiceRequest request);

    void deleteInvoice(String id);

    // ============================================================
    // ✅ Cross-Module Integration Methods
    // ============================================================
    InvoiceResponse createFromAppointment(String appointmentId);

    InvoiceResponse createFromPrescription(String prescriptionId);

    InvoiceResponse createFromLabTest(String labTestId);
}