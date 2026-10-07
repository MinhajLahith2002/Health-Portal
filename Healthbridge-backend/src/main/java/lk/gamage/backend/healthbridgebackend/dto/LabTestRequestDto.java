package lk.gamage.backend.healthbridgebackend.dto;

import lombok.Data;

import java.util.List;

@Data
public class LabTestRequestDto {
    private String patientId;
    private String doctorId;
    private String hospitalId;
    private List<String> requestedTests;
    private String priority;
    private boolean homeCollectionRequested;
    private String clinicalNotes;
}
