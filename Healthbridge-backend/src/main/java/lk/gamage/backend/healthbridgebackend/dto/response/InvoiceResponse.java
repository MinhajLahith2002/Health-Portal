package lk.gamage.backend.healthbridgebackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponse {

    private String id;
    private String invoiceNumber;

    // Patient
    private String patientId;
    private String patientName;
    private String patientPhone;
    private String patientEmail;

    // Hospital
    private String hospitalId;
    private String hospitalName;
    private String departmentId;

    // Cross-Module References
    private String appointmentId;
    private String appointmentRef;
    private String medicalRecordId;
    private String diagnosis;
    private String prescriptionId;
    private String prescriptionRef;
    private String labTestId;
    private String labOrderNumber;
    private String doctorId;
    private String doctorName;
    private String doctorSpecialization;
    private String paymentId;
    private String insuranceClaimId;
    private String insuranceClaimNumber;
    private String insurancePolicyId;
    private BigDecimal insuranceCovered;
    private BigDecimal patientResponsible;

    // Billing Details
    private LocalDateTime issueDate;
    private LocalDateTime dueDate;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal tax;
    private BigDecimal total;
    private BigDecimal paidAmount;
    private BigDecimal balance;
    private String status;
    private String paymentStatus;
    private String notes;
    private String invoiceSource;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}