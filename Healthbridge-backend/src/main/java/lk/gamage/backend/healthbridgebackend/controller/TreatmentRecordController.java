package lk.gamage.backend.healthbridgebackend.controller;

import jakarta.validation.Valid;

import lk.gamage.backend.healthbridgebackend.dto.request.TreatmentRecordRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.TreatmentRecordResponse;

import lk.gamage.backend.healthbridgebackend.model.Role;

import lk.gamage.backend.healthbridgebackend.security.CustomUserDetails;

import lk.gamage.backend.healthbridgebackend.service.EhrAccessService;
import lk.gamage.backend.healthbridgebackend.service.TreatmentRecordService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/treatments")
public class TreatmentRecordController {


    private final TreatmentRecordService
            treatmentRecordService;

    private final EhrAccessService
            ehrAccessService;


    public TreatmentRecordController(
            TreatmentRecordService treatmentRecordService,
            EhrAccessService ehrAccessService
    ) {

        this.treatmentRecordService =
                treatmentRecordService;

        this.ehrAccessService =
                ehrAccessService;
    }


    /*
     * ---------------------------------------------------------
     * CREATE TREATMENT
     *
     * DOCTOR ONLY
     *
     * doctorId comes from JWT.
     * ---------------------------------------------------------
     */
    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<TreatmentRecordResponse>
    createTreatment(

            @Valid
            @RequestBody
            TreatmentRecordRequest request,

            Authentication authentication
    ) {


        /*
         * Doctor must own this active MedicalRecord
         * and patientId must match the record.
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


        /*
         * Never trust doctorId
         * supplied from frontend.
         */
        request.setDoctorId(
                currentDoctor.getId()
        );


        TreatmentRecordResponse response =
                treatmentRecordService
                        .createTreatment(
                                request
                        );


        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    /*
     * ---------------------------------------------------------
     * GET ALL TREATMENTS
     *
     * ADMIN / SUPER ADMIN ONLY
     * ---------------------------------------------------------
     */
    @GetMapping
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'SUPER_ADMIN')"
    )
    public ResponseEntity<List<TreatmentRecordResponse>>
    getAllTreatments() {

        return ResponseEntity.ok(
                treatmentRecordService
                        .getAllTreatments()
        );
    }


    /*
     * ---------------------------------------------------------
     * GET TREATMENTS BY MEDICAL RECORD
     *
     * PATIENT:
     * own MedicalRecord only.
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
    public ResponseEntity<List<TreatmentRecordResponse>>
    getTreatmentsByMedicalRecord(

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
                treatmentRecordService
                        .getTreatmentsByMedicalRecord(
                                medicalRecordId
                        )
        );
    }


    /*
     * ---------------------------------------------------------
     * GET TREATMENTS BY PATIENT
     *
     * PATIENT:
     * own treatment history only.
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
    public ResponseEntity<List<TreatmentRecordResponse>>
    getTreatmentsByPatient(

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
                treatmentRecordService
                        .getTreatmentsByPatient(
                                patientId
                        )
        );
    }


    /*
     * ---------------------------------------------------------
     * GET TREATMENTS BY DOCTOR
     *
     * DOCTOR:
     * own treatment activity only.
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
    public ResponseEntity<List<TreatmentRecordResponse>>
    getTreatmentsByDoctor(

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
                treatmentRecordService
                        .getTreatmentsByDoctor(
                                doctorId
                        )
        );
    }


    /*
     * ---------------------------------------------------------
     * GET SINGLE TREATMENT
     *
     * PATIENT:
     * own treatment only.
     *
     * DOCTOR / ADMIN / SUPER ADMIN:
     * allowed.
     * ---------------------------------------------------------
     */
    @GetMapping("/{id}")
    @PreAuthorize(
            "hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN', 'SUPER_ADMIN')"
    )
    public ResponseEntity<TreatmentRecordResponse>
    getTreatmentById(

            @PathVariable
            String id,

            Authentication authentication
    ) {


        CustomUserDetails currentUser =
                (CustomUserDetails)
                        authentication.getPrincipal();


        if (Role.PATIENT.equals(currentUser.getRole())
                && !ehrAccessService
                .canPatientAccessTreatment(
                        id,
                        authentication
                )) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }


        return ResponseEntity.ok(
                treatmentRecordService
                        .getTreatmentById(
                                id
                        )
        );
    }


    /*
     * ---------------------------------------------------------
     * UPDATE TREATMENT
     *
     * DOCTOR ONLY
     *
     * Doctor can only update their own
     * treatment.
     * ---------------------------------------------------------
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<TreatmentRecordResponse>
    updateTreatment(

            @PathVariable
            String id,

            @Valid
            @RequestBody
            TreatmentRecordRequest request,

            Authentication authentication
    ) {


        /*
         * Existing Treatment must belong
         * to logged-in doctor and cannot
         * move to another patient/record.
         */
        if (!ehrAccessService
                .canDoctorUpdateTreatment(
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
         * still belong to logged-in doctor
         * and must not be archived.
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


        /*
         * Always overwrite doctorId
         * using JWT user ID.
         */
        request.setDoctorId(
                currentDoctor.getId()
        );


        return ResponseEntity.ok(
                treatmentRecordService
                        .updateTreatment(
                                id,
                                request
                        )
        );
    }


    /*
     * ---------------------------------------------------------
     * DELETE TREATMENT
     *
     * DOCTOR ONLY
     *
     * Doctor can delete only
     * their own treatment.
     * ---------------------------------------------------------
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Void>
    deleteTreatment(

            @PathVariable
            String id,

            Authentication authentication
    ) {


        if (!ehrAccessService
                .canDoctorDeleteTreatment(
                        id,
                        authentication
                )) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }


        treatmentRecordService
                .deleteTreatment(
                        id
                );


        return ResponseEntity
                .noContent()
                .build();
    }
}