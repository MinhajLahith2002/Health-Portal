package lk.gamage.backend.healthbridgebackend.controller;

import jakarta.validation.Valid;

import lk.gamage.backend.healthbridgebackend.dto.request.MedicalRecordRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.MedicalRecordResponse;
import lk.gamage.backend.healthbridgebackend.exception.BadRequestException;
import lk.gamage.backend.healthbridgebackend.model.Role;
import lk.gamage.backend.healthbridgebackend.security.CustomUserDetails;
import lk.gamage.backend.healthbridgebackend.service.EhrAccessService;
import lk.gamage.backend.healthbridgebackend.service.MedicalRecordService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {


    private final MedicalRecordService medicalRecordService;

    private final EhrAccessService ehrAccessService;


    public MedicalRecordController(
            MedicalRecordService medicalRecordService,
            EhrAccessService ehrAccessService
    ) {

        this.medicalRecordService =
                medicalRecordService;

        this.ehrAccessService =
                ehrAccessService;
    }


    /*
     * ---------------------------------------------------------
     * CREATE MEDICAL RECORD
     *
     * DOCTOR ONLY
     *
     * doctorId and doctorName come from JWT.
     * Frontend values are not trusted.
     * ---------------------------------------------------------
     */
    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<MedicalRecordResponse>
    createMedicalRecord(

            @Valid
            @RequestBody
            MedicalRecordRequest request,

            Authentication authentication
    ) {


        /*
         * patientId must belong to a real
         * PATIENT user.
         */
        if (!ehrAccessService.isValidPatient(
                request.getPatientId()
        )) {

            throw new BadRequestException(
                    "Valid patient ID is required"
            );
        }


        /*
         * Get logged-in doctor from JWT.
         */
        CustomUserDetails currentDoctor =
                (CustomUserDetails)
                        authentication.getPrincipal();


        /*
         * Never trust doctorId from frontend.
         */
        request.setDoctorId(
                currentDoctor.getId()
        );


        /*
         * Use logged-in doctor's name.
         */
        String doctorName =
                currentDoctor.getFullName();


        /*
         * Fallback to email if fullName
         * is missing.
         */
        if (doctorName == null
                || doctorName.isBlank()) {

            doctorName =
                    currentDoctor.getUsername();
        }


        request.setDoctorName(
                doctorName
        );


        MedicalRecordResponse response =
                medicalRecordService
                        .createMedicalRecord(
                                request
                        );


        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    /*
     * ---------------------------------------------------------
     * GET ALL ACTIVE MEDICAL RECORDS
     *
     * ADMIN / SUPER ADMIN ONLY
     * ---------------------------------------------------------
     */
    @GetMapping
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'SUPER_ADMIN')"
    )
    public ResponseEntity<List<MedicalRecordResponse>>
    getAllMedicalRecords() {

        return ResponseEntity.ok(
                medicalRecordService
                        .getAllMedicalRecords()
        );
    }


    /*
     * ---------------------------------------------------------
     * GET MEDICAL RECORD BY ID
     *
     * PATIENT:
     * can access own record only.
     *
     * DOCTOR:
     * can view patient records.
     *
     * ADMIN / SUPER ADMIN:
     * can view records.
     * ---------------------------------------------------------
     */
    @GetMapping("/{id}")
    @PreAuthorize(
            "hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN', 'SUPER_ADMIN')"
    )
    public ResponseEntity<MedicalRecordResponse>
    getMedicalRecordById(

            @PathVariable
            String id,

            Authentication authentication
    ) {


        CustomUserDetails currentUser =
                (CustomUserDetails)
                        authentication.getPrincipal();


        /*
         * PATIENT can only view
         * their own MedicalRecord.
         */
        if (Role.PATIENT.equals(currentUser.getRole())
                && !ehrAccessService
                .canPatientAccessMedicalRecord(
                        id,
                        authentication
                )) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }


        return ResponseEntity.ok(
                medicalRecordService
                        .getMedicalRecordById(
                                id
                        )
        );
    }


    /*
     * ---------------------------------------------------------
     * GET MEDICAL RECORDS BY PATIENT
     *
     * PATIENT:
     * own patientId only.
     *
     * DOCTOR:
     * can view a patient's records.
     *
     * ADMIN / SUPER ADMIN:
     * allowed.
     * ---------------------------------------------------------
     */
    @GetMapping("/patient/{patientId}")
    @PreAuthorize(
            "hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN', 'SUPER_ADMIN')"
    )
    public ResponseEntity<List<MedicalRecordResponse>>
    getMedicalRecordsByPatientId(

            @PathVariable
            String patientId,

            Authentication authentication
    ) {


        CustomUserDetails currentUser =
                (CustomUserDetails)
                        authentication.getPrincipal();


        /*
         * Patient A cannot request
         * Patient B records.
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
                medicalRecordService
                        .getMedicalRecordsByPatientId(
                                patientId
                        )
        );
    }


    /*
     * ---------------------------------------------------------
     * GET RECORDS BY DOCTOR
     *
     * DOCTOR:
     * can access own doctor records only.
     *
     * ADMIN / SUPER ADMIN:
     * can access any doctor's records.
     * ---------------------------------------------------------
     */
    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize(
            "hasAnyRole('DOCTOR', 'ADMIN', 'SUPER_ADMIN')"
    )
    public ResponseEntity<List<MedicalRecordResponse>>
    getMedicalRecordsByDoctorId(

            @PathVariable
            String doctorId,

            Authentication authentication
    ) {


        CustomUserDetails currentUser =
                (CustomUserDetails)
                        authentication.getPrincipal();


        /*
         * Doctor A cannot use
         * Doctor B doctorId here.
         */
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
                medicalRecordService
                        .getMedicalRecordsByDoctorId(
                                doctorId
                        )
        );
    }


    /*
     * ---------------------------------------------------------
     * GET ARCHIVED RECORDS
     *
     * ADMIN / SUPER ADMIN ONLY
     * ---------------------------------------------------------
     */
    @GetMapping("/archived")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'SUPER_ADMIN')"
    )
    public ResponseEntity<List<MedicalRecordResponse>>
    getArchivedMedicalRecords() {

        return ResponseEntity.ok(
                medicalRecordService
                        .getArchivedMedicalRecords()
        );
    }


    /*
     * ---------------------------------------------------------
     * UPDATE MEDICAL RECORD
     *
     * DOCTOR ONLY
     *
     * Doctor can only update a MedicalRecord
     * created by that logged-in doctor.
     *
     * patientId cannot be changed to
     * another patient.
     * ---------------------------------------------------------
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<MedicalRecordResponse>
    updateMedicalRecord(

            @PathVariable
            String id,

            @Valid
            @RequestBody
            MedicalRecordRequest request,

            Authentication authentication
    ) {


        /*
         * Check:
         *
         * JWT doctor ID ==
         * existing MedicalRecord.doctorId
         *
         * AND
         *
         * request.patientId ==
         * existing MedicalRecord.patientId
         */
        if (!ehrAccessService
                .canDoctorUpdateMedicalRecord(
                        id,
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
         * using JWT.
         */
        request.setDoctorId(
                currentDoctor.getId()
        );


        String doctorName =
                currentDoctor.getFullName();


        if (doctorName == null
                || doctorName.isBlank()) {

            doctorName =
                    currentDoctor.getUsername();
        }


        request.setDoctorName(
                doctorName
        );


        return ResponseEntity.ok(
                medicalRecordService
                        .updateMedicalRecord(
                                id,
                                request
                        )
        );
    }


    /*
     * ---------------------------------------------------------
     * ARCHIVE MEDICAL RECORD
     *
     * ADMIN / SUPER ADMIN ONLY
     * ---------------------------------------------------------
     */
    @PatchMapping("/{id}/archive")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'SUPER_ADMIN')"
    )
    public ResponseEntity<MedicalRecordResponse>
    archiveMedicalRecord(

            @PathVariable
            String id
    ) {

        return ResponseEntity.ok(
                medicalRecordService
                        .archiveMedicalRecord(
                                id
                        )
        );
    }


    /*
     * ---------------------------------------------------------
     * RESTORE MEDICAL RECORD
     *
     * ADMIN / SUPER ADMIN ONLY
     * ---------------------------------------------------------
     */
    @PatchMapping("/{id}/restore")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'SUPER_ADMIN')"
    )
    public ResponseEntity<MedicalRecordResponse>
    restoreMedicalRecord(

            @PathVariable
            String id
    ) {

        return ResponseEntity.ok(
                medicalRecordService
                        .restoreMedicalRecord(
                                id
                        )
        );
    }


    /*
     * ---------------------------------------------------------
     * PERMANENT DELETE
     *
     * SUPER ADMIN ONLY
     * ---------------------------------------------------------
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void>
    deleteMedicalRecordPermanently(

            @PathVariable
            String id
    ) {

        medicalRecordService
                .deleteMedicalRecordPermanently(
                        id
                );


        return ResponseEntity
                .noContent()
                .build();
    }
}