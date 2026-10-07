package lk.gamage.backend.healthbridgebackend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceRequest {

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
    private String prescriptionId;
    private String labTestId;
    private String medicalRecordId;
    private String doctorId;
    private String doctorName;
    private String diagnosis;

    // Dates
    private LocalDateTime issueDate;
    private LocalDateTime dueDate;

    // Financial
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal tax;
    private BigDecimal paidAmount;

    // Notes
    private String notes;
}