package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "invoices")
public class Invoice {

    @Id
    private String id;

    @Indexed(unique = true)
    private String invoiceNumber;

    // ============================================================
    // Patient Information
    // ============================================================
    private String patientId;
    private String patientName;
    private String patientPhone;
    private String patientEmail;

    // ============================================================
    // Hospital Information
    // ============================================================
    private String hospitalId;
    private String hospitalName;
    private String departmentId;         // 🆕 From Department

    // ============================================================
    // Cross-Module References (🆕 INTEGRATION)
    // ============================================================
    private String appointmentId;         // 🆕 Link to Appointment (Dev 05)
    private String appointmentRef;        // 🆕 Appointment reference number

    private String medicalRecordId;       // 🆕 Link to MedicalRecord (Dev 06)
    private String diagnosis;             // 🆕 From medical record

    private String prescriptionId;        // 🆕 Link to Prescription (Dev 07)
    private String prescriptionRef;       // 🆕 Prescription number

    private String labTestId;             // 🆕 Link to LabTest (Dev 08)
    private String labOrderNumber;        // 🆕 Lab test order number

    private String doctorId;              // 🆕 Link to Doctor (Dev 04)
    private String doctorName;            // 🆕 Doctor name
    private String doctorSpecialization;  // 🆕 Doctor specialization

    private String paymentId;             // 🆕 Link to Payment (Dev 16)
    private String paymentStatusRef;      // 🆕 Payment confirmation

    private String insuranceClaimId;      // 🆕 Link to InsuranceClaim (Dev 14)
    private String insuranceClaimNumber;  // 🆕 Claim number
    private String insurancePolicyId;     // 🆕 Link to InsurancePolicy

    // ============================================================
    // Billing Details
    // ============================================================
    private LocalDateTime issueDate;
    private LocalDateTime dueDate;

    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal tax;
    private BigDecimal total;
    private BigDecimal paidAmount;
    private BigDecimal balance;

    // 🆕 Insurance breakdown
    private BigDecimal insuranceCovered;      // Amount covered by insurance
    private BigDecimal patientResponsible;    // Amount patient pays

    // ============================================================
    // Status
    // ============================================================
    private String status;        // DRAFT, ISSUED, PAID, CANCELLED
    private String paymentStatus; // UNPAID, PARTIAL, PAID, REFUNDED

    // ============================================================
    // Metadata
    // ============================================================
    private String notes;
    private String createdBy;     // Who created this invoice
    private String invoiceSource; // MANUAL, APPOINTMENT, PRESCRIPTION, LAB, PHARMACY

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}