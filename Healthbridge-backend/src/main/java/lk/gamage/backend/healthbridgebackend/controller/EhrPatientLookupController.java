package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.dto.response.EhrPatientLookupResponse;
import lk.gamage.backend.healthbridgebackend.security.CustomUserDetails;
import lk.gamage.backend.healthbridgebackend.service.EhrPatientLookupService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
public class EhrPatientLookupController {

    private final EhrPatientLookupService ehrPatientLookupService;


    public EhrPatientLookupController(
            EhrPatientLookupService ehrPatientLookupService
    ) {
        this.ehrPatientLookupService =
                ehrPatientLookupService;
    }


    /*
     * =========================================================
     * SEARCH REGISTERED PATIENTS
     * =========================================================
     *
     * Used by:
     * - Create Medical Record
     * - EHR Patient Finder
     */
    @GetMapping("/patient-lookup")
    @PreAuthorize(
            "hasAnyRole('DOCTOR', 'ADMIN', 'SUPER_ADMIN')"
    )
    public ResponseEntity<
            List<EhrPatientLookupResponse>
            > searchPatients(

            @RequestParam(
                    name = "query",
                    required = false,
                    defaultValue = ""
            )
            String query
    ) {

        return ResponseEntity.ok(
                ehrPatientLookupService
                        .searchPatients(
                                query
                        )
        );
    }


    /*
     * =========================================================
     * DOCTOR -> MY EHR PATIENTS
     * =========================================================
     *
     * A patient appears here only when the current
     * doctor has at least one active MedicalRecord
     * for that patient.
     */
    @GetMapping("/my-patients")
    @PreAuthorize(
            "hasRole('DOCTOR')"
    )
    public ResponseEntity<
            List<EhrPatientLookupResponse>
            > getMyPatients(

            Authentication authentication
    ) {

        CustomUserDetails currentUser =
                (CustomUserDetails)
                        authentication
                                .getPrincipal();


        return ResponseEntity.ok(
                ehrPatientLookupService
                        .getDoctorPatients(
                                currentUser.getId()
                        )
        );
    }
}