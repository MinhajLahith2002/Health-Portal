package lk.gamage.backend.healthbridgebackend.service.impl;

import lk.gamage.backend.healthbridgebackend.dto.request.InvoiceRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.InvoiceResponse;
import lk.gamage.backend.healthbridgebackend.model.*;
import lk.gamage.backend.healthbridgebackend.repository.*;
import lk.gamage.backend.healthbridgebackend.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;

    // ✅ Cross-Module Repositories (Dev 05, 07, 08, 09)
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final MedicineRepository medicineRepository;
    private final LabTestRepository labTestRepository;

    // ============================================================
    // CREATE - Manual
    // ============================================================
    @Override
    public InvoiceResponse createInvoice(InvoiceRequest request) {
        log.info("📝 Creating invoice for patient: {}", request.getPatientId());

        try {
            Invoice invoice = Invoice.builder()
                    .invoiceNumber(generateInvoiceNumber())
                    .patientId(request.getPatientId())
                    .patientName(request.getPatientName())
                    .hospitalId(request.getHospitalId())
                    .issueDate(request.getIssueDate() != null ? request.getIssueDate() : LocalDateTime.now())
                    .dueDate(request.getDueDate())
                    .subtotal(request.getSubtotal() != null ? request.getSubtotal() : BigDecimal.ZERO)
                    .discount(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO)
                    .tax(request.getTax() != null ? request.getTax() : BigDecimal.ZERO)
                    .total(BigDecimal.ZERO)
                    .paidAmount(request.getPaidAmount() != null ? request.getPaidAmount() : BigDecimal.ZERO)
                    .balance(BigDecimal.ZERO)
                    .status("DRAFT")
                    .paymentStatus("UNPAID")
                    .notes(request.getNotes())
                    .invoiceSource("MANUAL")
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            recalculateInvoice(invoice);

            Invoice savedInvoice = invoiceRepository.save(invoice);
            log.info("✅ Invoice created: {}", savedInvoice.getInvoiceNumber());

            return mapToResponse(savedInvoice);
        } catch (Exception e) {
            log.error("❌ Error creating invoice: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create invoice: " + e.getMessage());
        }
    }

    // ============================================================
    // ✅ CREATE FROM APPOINTMENT (Dev 05 Integration)
    // ============================================================
    @Override
    public InvoiceResponse createFromAppointment(String appointmentId) {
        log.info("📋 Creating invoice from appointment: {}", appointmentId);

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found: " + appointmentId));

        Invoice invoice = Invoice.builder()
                .invoiceNumber(generateInvoiceNumber())
                .patientId(appointment.getPatientId())
                .patientName(appointment.getPatientName())
                .patientPhone(appointment.getPatientPhone())
                .patientEmail(appointment.getPatientEmail())
                .hospitalId(appointment.getHospitalId())
                .hospitalName(appointment.getHospital())
                .appointmentId(appointmentId)
                .appointmentRef(appointment.getReferenceNumber())
                .doctorId(appointment.getDoctorId())
                .doctorName(appointment.getDoctorName())
                .doctorSpecialization(appointment.getDoctorSpecialization())
                .issueDate(LocalDateTime.now())
                .subtotal(new BigDecimal("1500.00"))  // Default consultation fee
                .discount(BigDecimal.ZERO)
                .tax(BigDecimal.ZERO)
                .paidAmount(BigDecimal.ZERO)
                .status("ISSUED")
                .paymentStatus("UNPAID")
                .notes("Auto-generated from appointment: " + appointment.getReferenceNumber())
                .invoiceSource("APPOINTMENT")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        recalculateInvoice(invoice);
        Invoice saved = invoiceRepository.save(invoice);

        log.info("✅ Invoice created from appointment: {}", saved.getInvoiceNumber());
        return mapToResponse(saved);
    }

    // ============================================================
    // ✅ CREATE FROM PRESCRIPTION (Dev 07 + Dev 09 Integration)
    // ============================================================
    @Override
    public InvoiceResponse createFromPrescription(String prescriptionId) {
        log.info("💊 Creating invoice from prescription: {}", prescriptionId);

        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new RuntimeException("Prescription not found: " + prescriptionId));

        BigDecimal subtotal = BigDecimal.ZERO;

        // ✅ Calculate total from prescription items
        if (prescription.getItems() != null && !prescription.getItems().isEmpty()) {
            for (PrescriptionItem item : prescription.getItems()) {
                Medicine medicine = null;
                if (item.getMedicineId() != null && !item.getMedicineId().isBlank()) {
                    medicine = medicineRepository.findById(item.getMedicineId()).orElse(null);
                    if (medicine == null) {
                        medicine = medicineRepository.findByMedicineCode(item.getMedicineId()).orElse(null);
                    }
                }
                if (medicine == null && item.getMedicineName() != null && !item.getMedicineName().isBlank()) {
                    List<Medicine> matches = medicineRepository.findByNameContainingIgnoreCase(item.getMedicineName());
                    if (!matches.isEmpty()) {
                        medicine = matches.get(0);
                    }
                }

                if (medicine != null && medicine.getUnitPrice() > 0) {
                    BigDecimal itemPrice = BigDecimal.valueOf(medicine.getUnitPrice())
                            .multiply(BigDecimal.valueOf(item.getQuantity()));
                    subtotal = subtotal.add(itemPrice);
                }
            }
        }

        Invoice invoice = Invoice.builder()
                .invoiceNumber(generateInvoiceNumber())
                .patientId(prescription.getPatientId())
                .patientName(prescription.getPatientName())
                .patientPhone(prescription.getPatientPhone())
                .prescriptionId(prescriptionId)
                .prescriptionRef(prescription.getPrescriptionNumber())
                .doctorId(prescription.getDoctorId())
                .doctorName(prescription.getDoctorName())
                .diagnosis(prescription.getDiagnosis())
                .issueDate(LocalDateTime.now())
                .subtotal(subtotal)
                .discount(BigDecimal.ZERO)
                .tax(BigDecimal.ZERO)
                .paidAmount(BigDecimal.ZERO)
                .status("ISSUED")
                .paymentStatus("UNPAID")
                .notes("Auto-generated from prescription: " + prescription.getPrescriptionNumber())
                .invoiceSource("PRESCRIPTION")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        recalculateInvoice(invoice);
        Invoice saved = invoiceRepository.save(invoice);

        log.info("✅ Invoice created from prescription: {}", saved.getInvoiceNumber());
        return mapToResponse(saved);
    }

    // ============================================================
    // ✅ CREATE FROM LAB TEST (Dev 08 Integration)
    // ============================================================
    @Override
    public InvoiceResponse createFromLabTest(String labTestId) {
        log.info("🧪 Creating invoice from lab test: {}", labTestId);

        LabTest labTest = labTestRepository.findById(labTestId)
                .orElseThrow(() -> new RuntimeException("Lab test not found: " + labTestId));

        // ✅ Calculate lab test fee based on number of tests
        BigDecimal labFee = BigDecimal.ZERO;
        if (labTest.getRequestedTests() != null) {
            labFee = BigDecimal.valueOf(labTest.getRequestedTests().size())
                    .multiply(new BigDecimal("500.00"));  // Rs. 500 per test
        }

        Invoice invoice = Invoice.builder()
                .invoiceNumber(generateInvoiceNumber())
                .patientId(labTest.getPatientId())
                .labTestId(labTestId)
                .labOrderNumber(labTest.getTestOrderNumber())
                .doctorId(labTest.getDoctorId())
                .hospitalId(labTest.getHospitalId())
                .issueDate(LocalDateTime.now())
                .subtotal(labFee)
                .discount(BigDecimal.ZERO)
                .tax(BigDecimal.ZERO)
                .paidAmount(BigDecimal.ZERO)
                .status("ISSUED")
                .paymentStatus("UNPAID")
                .notes("Auto-generated from lab test: " + labTest.getTestOrderNumber())
                .invoiceSource("LAB")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        recalculateInvoice(invoice);
        Invoice saved = invoiceRepository.save(invoice);

        log.info("✅ Invoice created from lab test: {}", saved.getInvoiceNumber());
        return mapToResponse(saved);
    }

    // ============================================================
    // UPDATE
    // ============================================================
    @Override
    public InvoiceResponse updateInvoice(String id, InvoiceRequest request) {
        log.info("✏️ Updating invoice: {}", id);

        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));

        invoice.setPatientId(request.getPatientId());
        invoice.setPatientName(request.getPatientName());
        invoice.setHospitalId(request.getHospitalId());

        if (request.getIssueDate() != null) {
            invoice.setIssueDate(request.getIssueDate());
        }

        invoice.setDueDate(request.getDueDate());
        invoice.setSubtotal(request.getSubtotal() != null ? request.getSubtotal() : BigDecimal.ZERO);
        invoice.setDiscount(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO);
        invoice.setTax(request.getTax() != null ? request.getTax() : BigDecimal.ZERO);
        invoice.setPaidAmount(request.getPaidAmount() != null ? request.getPaidAmount() : BigDecimal.ZERO);
        invoice.setNotes(request.getNotes());
        invoice.setUpdatedAt(LocalDateTime.now());

        recalculateInvoice(invoice);

        Invoice updated = invoiceRepository.save(invoice);
        log.info("✅ Invoice updated: {}", updated.getInvoiceNumber());

        return mapToResponse(updated);
    }

    // ============================================================
    // HELPERS
    // ============================================================
    private void recalculateInvoice(Invoice invoice) {
        BigDecimal subtotal = invoice.getSubtotal() != null ? invoice.getSubtotal() : BigDecimal.ZERO;
        BigDecimal discount = invoice.getDiscount() != null ? invoice.getDiscount() : BigDecimal.ZERO;
        BigDecimal tax = invoice.getTax() != null ? invoice.getTax() : BigDecimal.ZERO;
        BigDecimal paidAmount = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : BigDecimal.ZERO;

        BigDecimal total = subtotal.subtract(discount).add(tax);
        if (total.compareTo(BigDecimal.ZERO) < 0) total = BigDecimal.ZERO;
        invoice.setTotal(total);

        BigDecimal balance = total.subtract(paidAmount);
        if (balance.compareTo(BigDecimal.ZERO) < 0) balance = BigDecimal.ZERO;
        invoice.setBalance(balance);

        invoice.setPaymentStatus(determinePaymentStatus(paidAmount, total));
        invoice.setStatus(determineInvoiceStatus(total, balance));
    }

    private String determinePaymentStatus(BigDecimal paidAmount, BigDecimal total) {
        if (paidAmount.compareTo(BigDecimal.ZERO) == 0) return "UNPAID";
        if (paidAmount.compareTo(total) >= 0) return "PAID";
        return "PARTIAL";
    }

    private String determineInvoiceStatus(BigDecimal total, BigDecimal balance) {
        if (total.compareTo(BigDecimal.ZERO) == 0) return "DRAFT";
        if (balance.compareTo(BigDecimal.ZERO) == 0) return "PAID";
        return "ISSUED";
    }

    private String generateInvoiceNumber() {
        return "INV-" + LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS"));
    }

    // ============================================================
    // READ
    // ============================================================
    @Override
    public List<InvoiceResponse> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public InvoiceResponse getInvoice(String id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));
        return mapToResponse(invoice);
    }

    @Override
    public List<InvoiceResponse> getPatientInvoices(String patientId) {
        return invoiceRepository.findByPatientId(patientId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ============================================================
    // DELETE
    // ============================================================
    @Override
    public void deleteInvoice(String id) {
        if (!invoiceRepository.existsById(id)) {
            throw new RuntimeException("Invoice not found: " + id);
        }
        invoiceRepository.deleteById(id);
    }

    // ============================================================
    // MAPPER
    // ============================================================
    private InvoiceResponse mapToResponse(Invoice invoice) {
        return InvoiceResponse.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .patientId(invoice.getPatientId())
                .patientName(invoice.getPatientName())
                .patientPhone(invoice.getPatientPhone())
                .patientEmail(invoice.getPatientEmail())
                .hospitalId(invoice.getHospitalId())
                .hospitalName(invoice.getHospitalName())
                .departmentId(invoice.getDepartmentId())
                .appointmentId(invoice.getAppointmentId())
                .appointmentRef(invoice.getAppointmentRef())
                .medicalRecordId(invoice.getMedicalRecordId())
                .diagnosis(invoice.getDiagnosis())
                .prescriptionId(invoice.getPrescriptionId())
                .prescriptionRef(invoice.getPrescriptionRef())
                .labTestId(invoice.getLabTestId())
                .labOrderNumber(invoice.getLabOrderNumber())
                .doctorId(invoice.getDoctorId())
                .doctorName(invoice.getDoctorName())
                .doctorSpecialization(invoice.getDoctorSpecialization())
                .paymentId(invoice.getPaymentId())
                .insuranceClaimId(invoice.getInsuranceClaimId())
                .insuranceClaimNumber(invoice.getInsuranceClaimNumber())
                .insurancePolicyId(invoice.getInsurancePolicyId())
                .insuranceCovered(invoice.getInsuranceCovered())
                .patientResponsible(invoice.getPatientResponsible())
                .issueDate(invoice.getIssueDate())
                .dueDate(invoice.getDueDate())
                .subtotal(invoice.getSubtotal())
                .discount(invoice.getDiscount())
                .tax(invoice.getTax())
                .total(invoice.getTotal())
                .paidAmount(invoice.getPaidAmount())
                .balance(invoice.getBalance())
                .status(invoice.getStatus())
                .paymentStatus(invoice.getPaymentStatus())
                .notes(invoice.getNotes())
                .invoiceSource(invoice.getInvoiceSource())
                .createdAt(invoice.getCreatedAt())
                .updatedAt(invoice.getUpdatedAt())
                .build();
    }
}