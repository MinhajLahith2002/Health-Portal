package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.dto.response.PatientEhrHistoryResponse;
import lk.gamage.backend.healthbridgebackend.model.Role;
import lk.gamage.backend.healthbridgebackend.security.CustomUserDetails;
import lk.gamage.backend.healthbridgebackend.service.EhrAccessService;
import lk.gamage.backend.healthbridgebackend.service.PatientEhrHistoryService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/medical-records/patient")
public class PatientEhrHistoryController {


    private final PatientEhrHistoryService
            patientEhrHistoryService;

    private final EhrAccessService
            ehrAccessService;


    public PatientEhrHistoryController(

            PatientEhrHistoryService patientEhrHistoryService,

            EhrAccessService ehrAccessService
    ) {

        this.patientEhrHistoryService =
                patientEhrHistoryService;

        this.ehrAccessService =
                ehrAccessService;
    }


    /*
     * ---------------------------------------------------------
     * PATIENT EHR HISTORY
     *
     * PATIENT:
     * can view own EHR history only.
     *
     * DOCTOR:
     * can view patient EHR history.
     *
     * ADMIN / SUPER ADMIN:
     * can view patient EHR history.
     * ---------------------------------------------------------
     */
    @GetMapping("/{patientId}/history")
    @PreAuthorize(
            "hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN', 'SUPER_ADMIN')"
    )
    public ResponseEntity<PatientEhrHistoryResponse>
    getPatientEhrHistory(

            @PathVariable
            String patientId,

            Authentication authentication
    ) {


        CustomUserDetails currentUser =
                (CustomUserDetails)
                        authentication.getPrincipal();


        /*
         * Patient A cannot access
         * Patient B EHR history.
         */
        if (Role.PATIENT.equals(currentUser.getRole())
                && !ehrAccessService
                .isCurrentPatient(
                        patientId,
                        authentication
                )) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }


        return ResponseEntity.ok(
                patientEhrHistoryService
                        .getPatientEhrHistory(
                                patientId
                        )
        );
    }
}