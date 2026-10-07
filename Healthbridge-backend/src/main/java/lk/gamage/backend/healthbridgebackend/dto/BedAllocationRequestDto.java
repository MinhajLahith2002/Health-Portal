package lk.gamage.backend.healthbridgebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BedAllocationRequestDto {

    private String searchPatient;
    private String patientId;
    private String firstName;
    private String lastName;
    private String dob;
    private Integer age;
    private String gender;
    private String department;
    private String bedType;
    private String assignedDoctor;
    private String admissionDate;
    private String expDischarge;
    private String admissionNotes;
    private String eta;
}
