package lk.gamage.backend.healthbridgebackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EhrPatientLookupResponse {

    private String id;
    private String fullName;
    private String dateOfBirth;
    private String gender;
    private String bloodGroup;
    private String picture;

    /*
     * These two fields are used by:
     * Doctor -> My EHR Patients
     */
    private String lastVisitDate;
    private Integer recordCount;
}