package lk.gamage.backend.healthbridgebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientInfoDto {

    private String id;
    private String firstName;
    private String lastName;
    private String dob;
    private Integer age;
    private String gender;
    private String assignedDoctor;
    private String admissionDate;
    private String expDischarge;
    private String admissionNotes;
    private String eta;
    private String currentWard;
    private String currentBedId;
}
