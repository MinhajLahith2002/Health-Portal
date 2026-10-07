package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.dto.request.InvoiceRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.InvoiceResponse;
import lk.gamage.backend.healthbridgebackend.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/hospital-billing/invoices")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping
    public ResponseEntity<InvoiceResponse> createInvoice(
            @RequestBody InvoiceRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(invoiceService.createInvoice(request));
    }

    @GetMapping
    public ResponseEntity<List<InvoiceResponse>> getAllInvoices() {

        return ResponseEntity.ok(
                invoiceService.getAllInvoices()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> getInvoice(
            @PathVariable String id) {

        return ResponseEntity.ok(
                invoiceService.getInvoice(id)
        );
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<InvoiceResponse>> getPatientInvoices(
            @PathVariable String patientId) {

        return ResponseEntity.ok(
                invoiceService.getPatientInvoices(patientId)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<InvoiceResponse> updateInvoice(
            @PathVariable String id,
            @RequestBody InvoiceRequest request) {

        return ResponseEntity.ok(
                invoiceService.updateInvoice(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(
            @PathVariable String id) {

        invoiceService.deleteInvoice(id);

        return ResponseEntity
                .noContent()
                .build();
    }

    // InvoiceController.java
    @PostMapping("/from-appointment/{appointmentId}")
    public ResponseEntity<InvoiceResponse> createFromAppointment(
            @PathVariable String appointmentId) {
        return ResponseEntity.ok(
                invoiceService.createFromAppointment(appointmentId)
        );
    }

    // InvoiceController.java
    @PostMapping("/from-prescription/{prescriptionId}")
    public ResponseEntity<InvoiceResponse> createFromPrescription(
            @PathVariable String prescriptionId) {
        return ResponseEntity.ok(
                invoiceService.createFromPrescription(prescriptionId)
        );
    }
    @PostMapping("/from-lab-test/{labTestId}")
    public ResponseEntity<InvoiceResponse> createFromLabTest(
            @PathVariable String labTestId) {
        return ResponseEntity.ok(
                invoiceService.createFromLabTest(labTestId)
        );
    }
}