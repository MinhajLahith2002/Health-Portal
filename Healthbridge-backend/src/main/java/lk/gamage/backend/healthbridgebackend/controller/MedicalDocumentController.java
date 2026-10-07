package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.dto.request.MedicalDocumentUpdateRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.MedicalDocumentResponse;

import lk.gamage.backend.healthbridgebackend.model.Role;

import lk.gamage.backend.healthbridgebackend.security.CustomUserDetails;

import lk.gamage.backend.healthbridgebackend.service.EhrAccessService;
import lk.gamage.backend.healthbridgebackend.service.MedicalDocumentService;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;


@RestController
@RequestMapping("/api/medical-documents")
public class MedicalDocumentController {


    private final MedicalDocumentService medicalDocumentService;
    private final EhrAccessService ehrAccessService;


    public MedicalDocumentController(
            MedicalDocumentService medicalDocumentService,
            EhrAccessService ehrAccessService
    ) {

        this.medicalDocumentService =
                medicalDocumentService;

        this.ehrAccessService =
                ehrAccessService;
    }


    /*
     * ---------------------------------------------------------
     * UPLOAD MEDICAL DOCUMENT
     *
     * DOCTOR ONLY
     *
     * doctorId is taken from JWT.
     * doctorId sent by frontend is ignored.
     * ---------------------------------------------------------
     */
    @PostMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<MedicalDocumentResponse>
    uploadMedicalDocument(

            @RequestParam("file")
            MultipartFile file,

            @RequestParam("medicalRecordId")
            String medicalRecordId,

            @RequestParam("patientId")
            String patientId,

            /*
             * Optional only for backward compatibility.
             * We do NOT trust this value.
             */
            @RequestParam(
                    value = "doctorId",
                    required = false
            )
            String ignoredDoctorId,

            @RequestParam("documentType")
            String documentType,

            @RequestParam(
                    value = "description",
                    required = false
            )
            String description,

            Authentication authentication
    ) {


        /*
         * Logged-in doctor must own
         * the active MedicalRecord.
         *
         * Also checks patientId matches
         * the MedicalRecord patientId.
         */
        if (!ehrAccessService
                .canDoctorUseMedicalRecord(
                        medicalRecordId,
                        patientId,
                        authentication
                )) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }


        CustomUserDetails currentDoctor =
                (CustomUserDetails)
                        authentication.getPrincipal();


        MedicalDocumentResponse response =
                medicalDocumentService
                        .uploadDocument(
                                file,
                                medicalRecordId,
                                patientId,
                                currentDoctor.getId(),
                                documentType,
                                description
                        );


        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    /*
     * ---------------------------------------------------------
     * GET ALL ACTIVE DOCUMENTS
     *
     * ADMIN / SUPER ADMIN ONLY
     * ---------------------------------------------------------
     */
    @GetMapping
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'SUPER_ADMIN')"
    )
    public ResponseEntity<List<MedicalDocumentResponse>>
    getAllDocuments() {

        return ResponseEntity.ok(
                medicalDocumentService
                        .getAllDocuments()
        );
    }


    /*
     * ---------------------------------------------------------
     * GET ARCHIVED DOCUMENTS
     *
     * ADMIN / SUPER ADMIN ONLY
     * ---------------------------------------------------------
     */
    @GetMapping("/archived")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'SUPER_ADMIN')"
    )
    public ResponseEntity<List<MedicalDocumentResponse>>
    getArchivedDocuments() {

        return ResponseEntity.ok(
                medicalDocumentService
                        .getArchivedDocuments()
        );
    }


    /*
     * ---------------------------------------------------------
     * DOCUMENT VERSION HISTORY
     *
     * PATIENT:
     * own document history only.
     *
     * DOCTOR:
     * clinical document history view.
     *
     * ADMIN / SUPER ADMIN:
     * allowed.
     * ---------------------------------------------------------
     */
    @GetMapping(
            "/versions/{documentGroupIdOrDocumentId}"
    )
    @PreAuthorize(
            "hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN', 'SUPER_ADMIN')"
    )
    public ResponseEntity<List<MedicalDocumentResponse>>
    getDocumentVersionHistory(

            @PathVariable
            String documentGroupIdOrDocumentId,

            Authentication authentication
    ) {


        CustomUserDetails currentUser =
                (CustomUserDetails)
                        authentication.getPrincipal();


        if (Role.PATIENT.equals(currentUser.getRole())
                && !ehrAccessService
                .canPatientAccessDocumentVersionHistory(
                        documentGroupIdOrDocumentId,
                        authentication
                )) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }


        if (Role.DOCTOR.equals(currentUser.getRole())
                && !ehrAccessService
                .canDoctorAccessDocumentVersionHistory(
                        documentGroupIdOrDocumentId,
                        authentication
                )) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }


        return ResponseEntity.ok(
                medicalDocumentService
                        .getDocumentVersionHistory(
                                documentGroupIdOrDocumentId
                        )
        );
    }


    /*
     * ---------------------------------------------------------
     * GET DOCUMENT BY ID
     *
     * PATIENT:
     * own active document only.
     *
     * DOCTOR:
     * active clinical document.
     *
     * ADMIN / SUPER ADMIN:
     * allowed.
     * ---------------------------------------------------------
     */
    @GetMapping("/{id}")
    @PreAuthorize(
            "hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN', 'SUPER_ADMIN')"
    )
    public ResponseEntity<MedicalDocumentResponse>
    getDocumentById(

            @PathVariable
            String id,

            Authentication authentication
    ) {


        CustomUserDetails currentUser =
                (CustomUserDetails)
                        authentication.getPrincipal();


        if (Role.PATIENT.equals(currentUser.getRole())
                && !ehrAccessService
                .canPatientAccessMedicalDocument(
                        id,
                        authentication
                )) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }


        if (Role.DOCTOR.equals(currentUser.getRole())
                && !ehrAccessService
                .canDoctorViewMedicalDocument(
                        id,
                        authentication
                )) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }


        return ResponseEntity.ok(
                medicalDocumentService
                        .getDocumentById(id)
        );
    }


    /*
     * ---------------------------------------------------------
     * GET DOCUMENTS BY MEDICAL RECORD
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
    public ResponseEntity<List<MedicalDocumentResponse>>
    getDocumentsByMedicalRecord(

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
                medicalDocumentService
                        .getDocumentsByMedicalRecord(
                                medicalRecordId
                        )
        );
    }


    /*
     * ---------------------------------------------------------
     * GET DOCUMENTS BY PATIENT
     *
     * PATIENT:
     * own documents only.
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
    public ResponseEntity<List<MedicalDocumentResponse>>
    getDocumentsByPatient(

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
                medicalDocumentService
                        .getDocumentsByPatient(
                                patientId
                        )
        );
    }


    /*
     * ---------------------------------------------------------
     * GET DOCUMENTS BY DOCTOR
     *
     * DOCTOR:
     * own doctor ID only.
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
    public ResponseEntity<List<MedicalDocumentResponse>>
    getDocumentsByDoctor(

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
                medicalDocumentService
                        .getDocumentsByDoctor(
                                doctorId
                        )
        );
    }


    /*
     * ---------------------------------------------------------
     * UPDATE DOCUMENT METADATA
     *
     * DOCTOR ONLY
     *
     * Doctor must own parent MedicalRecord.
     * ---------------------------------------------------------
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<MedicalDocumentResponse>
    updateDocumentMetadata(

            @PathVariable
            String id,

            @RequestBody
            MedicalDocumentUpdateRequest request,

            Authentication authentication
    ) {


        if (!ehrAccessService
                .canDoctorModifyMedicalDocument(
                        id,
                        authentication
                )) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }


        return ResponseEntity.ok(
                medicalDocumentService
                        .updateDocumentMetadata(
                                id,
                                request
                        )
        );
    }


    /*
     * ---------------------------------------------------------
     * REPLACE DOCUMENT FILE
     *
     * DOCTOR ONLY
     *
     * doctorId comes from JWT.
     * ---------------------------------------------------------
     */
    @PutMapping(
            value = "/{id}/replace",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<MedicalDocumentResponse>
    replaceDocumentFile(

            @PathVariable
            String id,

            @RequestParam("file")
            MultipartFile file,

            /*
             * Optional only for old requests.
             * This value is ignored.
             */
            @RequestParam(
                    value = "doctorId",
                    required = false
            )
            String ignoredDoctorId,

            @RequestParam(
                    value = "description",
                    required = false
            )
            String description,

            Authentication authentication
    ) {


        if (!ehrAccessService
                .canDoctorModifyMedicalDocument(
                        id,
                        authentication
                )) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }


        CustomUserDetails currentDoctor =
                (CustomUserDetails)
                        authentication.getPrincipal();


        MedicalDocumentResponse response =
                medicalDocumentService
                        .replaceDocumentFile(
                                id,
                                file,
                                currentDoctor.getId(),
                                description
                        );


        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    /*
     * ---------------------------------------------------------
     * ARCHIVE DOCUMENT
     *
     * DOCTOR:
     * can archive document belonging to
     * their own MedicalRecord.
     *
     * ADMIN / SUPER ADMIN:
     * allowed.
     * ---------------------------------------------------------
     */
    @PatchMapping("/{id}/archive")
    @PreAuthorize(
            "hasAnyRole('DOCTOR', 'ADMIN', 'SUPER_ADMIN')"
    )
    public ResponseEntity<MedicalDocumentResponse>
    archiveDocument(

            @PathVariable
            String id,

            Authentication authentication
    ) {


        CustomUserDetails currentUser =
                (CustomUserDetails)
                        authentication.getPrincipal();


        if (Role.DOCTOR.equals(currentUser.getRole())
                && !ehrAccessService
                .canDoctorModifyMedicalDocument(
                        id,
                        authentication
                )) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }


        return ResponseEntity.ok(
                medicalDocumentService
                        .archiveDocument(id)
        );
    }


    /*
     * ---------------------------------------------------------
     * PERMANENT DELETE
     *
     * SUPER ADMIN ONLY
     *
     * Service layer still requires
     * document status = ARCHIVED.
     * ---------------------------------------------------------
     */
    @DeleteMapping("/{id}/permanent")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void>
    permanentlyDeleteDocument(

            @PathVariable
            String id
    ) {


        medicalDocumentService
                .permanentlyDeleteDocument(
                        id
                );


        return ResponseEntity
                .noContent()
                .build();
    }
}