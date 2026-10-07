package lk.gamage.backend.healthbridgebackend.controller;

import jakarta.validation.Valid;

import lk.gamage.backend.healthbridgebackend.dto.request.DiagnosisRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.DiagnosisResponse;

import lk.gamage.backend.healthbridgebackend.model.Role;

import lk.gamage.backend.healthbridgebackend.security.CustomUserDetails;

import lk.gamage.backend.healthbridgebackend.service.DiagnosisService;
import lk.gamage.backend.healthbridgebackend.service.EhrAccessService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/diagnoses")
public class DiagnosisController {


    private final DiagnosisService
            diagnosisService;

    private final EhrAccessService
            ehrAccessService;


    public DiagnosisController(
            DiagnosisService diagnosisService,
            EhrAccessService ehrAccessService
    ) {

        this.diagnosisService =
                diagnosisService;

        this.ehrAccessService =
                ehrAccessService;
    }


    /*
     * ---------------------------------------------------------
     * CREATE DIAGNOSIS
     *
     * DOCTOR ONLY
     *
     * Doctor must own the MedicalRecord.
     * doctorId is taken from JWT.
     * ---------------------------------------------------------
     */
    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DiagnosisResponse>
    createDiagnosis(

            @Valid
            @RequestBody
            DiagnosisRequest request,

            Authentication authentication
    ) {


        if (!ehrAccessService
                .canDoctorUseMedicalRecord(
                        request.getMedicalRecordId(),
                        request.getPatientId(),
                        authentication
                )) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }


        CustomUserDetails currentDoctor =
                (CustomUserDetails)
                        authentication.getPrincipal();


        /*
         * Never trust doctorId
         * supplied by frontend.
         */
        request.setDoctorId(
                currentDoctor.getId()
        );


        DiagnosisResponse response =
                diagnosisService
                        .createDiagnosis(
                                request
                        );


        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    /*
     * ---------------------------------------------------------
     * GET ALL DIAGNOSES
     *
     * ADMIN / SUPER ADMIN ONLY
     * ---------------------------------------------------------
     */
    @GetMapping
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'SUPER_ADMIN')"
    )
    public ResponseEntity<List<DiagnosisResponse>>
    getAllDiagnoses() {

        return ResponseEntity.ok(
                diagnosisService
                        .getAllDiagnoses()
        );
    }


    /*
     * ---------------------------------------------------------
     * GET DIAGNOSES BY MEDICAL RECORD
     *
     * PATIENT:
     * only own MedicalRecord.
     *
     * DOCTOR / ADMIN / SUPER ADMIN:
     * allowed.
     * ---------------------------------------------------------
     */
    @GetMapping(
            "/record/{medicalRecordId}"
    )
    @PreAuthorize(
            "hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN', 'SUPER_ADMIN')"
    )
    public ResponseEntity<List<DiagnosisResponse>>
    getDiagnosesByMedicalRecord(

            @PathVariable
            String medicalRecordId,

            Authentication authentication
    ) {


        CustomUserDetails currentUser =
                (CustomUserDetails)
                        authentication.getPrincipal();


        if (Role.PATIENT.equals(currentUser.getRole())
                && !ehrAccessService
                .canPatientAccessMedicalRecord(
                        medicalRecordId,
                        authentication
                )) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }


        return ResponseEntity.ok(
                diagnosisService
                        .getDiagnosesByMedicalRecord(
                                medicalRecordId
                        )
        );
    }


    /*
     * ---------------------------------------------------------
     * GET DIAGNOSES BY PATIENT
     *
     * PATIENT:
     * own diagnoses only.
     *
     * DOCTOR / ADMIN / SUPER ADMIN:
     * allowed.
     * ---------------------------------------------------------
     */
    @GetMapping(
            "/patient/{patientId}"
    )
    @PreAuthorize(
            "hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN', 'SUPER_ADMIN')"
    )
    public ResponseEntity<List<DiagnosisResponse>>
    getDiagnosesByPatient(

            @PathVariable
            String patientId,

            Authentication authentication
    ) {


        CustomUserDetails currentUser =
                (CustomUserDetails)
                        authentication.getPrincipal();


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
                diagnosisService
                        .getDiagnosesByPatient(
                                patientId
                        )
        );
    }


    /*
     * ---------------------------------------------------------
     * GET DIAGNOSES BY DOCTOR
     *
     * DOCTOR:
     * own diagnoses only.
     *
     * ADMIN / SUPER ADMIN:
     * allowed.
     * ---------------------------------------------------------
     */
    @GetMapping(
            "/doctor/{doctorId}"
    )
    @PreAuthorize(
            "hasAnyRole('DOCTOR', 'ADMIN', 'SUPER_ADMIN')"
    )
    public ResponseEntity<List<DiagnosisResponse>>
    getDiagnosesByDoctor(

            @PathVariable
            String doctorId,

            Authentication authentication
    ) {


        CustomUserDetails currentUser =
                (CustomUserDetails)
                        authentication.getPrincipal();


        if (Role.DOCTOR.equals(currentUser.getRole())
                && !ehrAccessService
                .isCurrentDoctor(
                        doctorId,
                        authentication
                )) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }


        return ResponseEntity.ok(
                diagnosisService
                        .getDiagnosesByDoctor(
                                doctorId
                        )
        );
    }


    /*
     * ---------------------------------------------------------
     * GET SINGLE DIAGNOSIS
     *
     * PATIENT:
     * own diagnosis only.
     *
     * DOCTOR / ADMIN / SUPER ADMIN:
     * allowed.
     * ---------------------------------------------------------
     */
    @GetMapping("/{id}")
    @PreAuthorize(
            "hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN', 'SUPER_ADMIN')"
    )
    public ResponseEntity<DiagnosisResponse>
    getDiagnosisById(

            @PathVariable
            String id,

            Authentication authentication
    ) {


        CustomUserDetails currentUser =
                (CustomUserDetails)
                        authentication.getPrincipal();


        if (Role.PATIENT.equals(currentUser.getRole())
                && !ehrAccessService
                .canPatientAccessDiagnosis(
                        id,
                        authentication
                )) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }


        return ResponseEntity.ok(
                diagnosisService
                        .getDiagnosisById(
                                id
                        )
        );
    }


    /*
     * ---------------------------------------------------------
     * UPDATE DIAGNOSIS
     *
     * DOCTOR ONLY
     *
     * Doctor can update only their
     * own diagnosis.
     *
     * Diagnosis cannot be moved to
     * another patient or MedicalRecord.
     * ---------------------------------------------------------
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DiagnosisResponse>
    updateDiagnosis(

            @PathVariable
            String id,

            @Valid
            @RequestBody
            DiagnosisRequest request,

            Authentication authentication
    ) {


        if (!ehrAccessService
                .canDoctorUpdateDiagnosis(
                        id,
                        request.getMedicalRecordId(),
                        request.getPatientId(),
                        authentication
                )) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }


        /*
         * Parent MedicalRecord must also
         * belong to logged-in doctor.
         */
        if (!ehrAccessService
                .canDoctorUseMedicalRecord(
                        request.getMedicalRecordId(),
                        request.getPatientId(),
                        authentication
                )) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }


        CustomUserDetails currentDoctor =
                (CustomUserDetails)
                        authentication.getPrincipal();


        request.setDoctorId(
                currentDoctor.getId()
        );


        return ResponseEntity.ok(
                diagnosisService
                        .updateDiagnosis(
                                id,
                                request
                        )
        );
    }


    /*
     * ---------------------------------------------------------
     * DELETE DIAGNOSIS
     *
     * DOCTOR ONLY
     *
     * Doctor can delete only
     * their own diagnosis.
     * ---------------------------------------------------------
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Void>
    deleteDiagnosis(

            @PathVariable
            String id,

            Authentication authentication
    ) {


        if (!ehrAccessService
                .canDoctorDeleteDiagnosis(
                        id,
                        authentication
                )) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }


        diagnosisService
                .deleteDiagnosis(
                        id
                );


        return ResponseEntity
                .noContent()
                .build();
    }
}