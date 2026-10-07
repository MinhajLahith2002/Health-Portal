package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.model.Role;
import lk.gamage.backend.healthbridgebackend.security.CustomUserDetails;
import lk.gamage.backend.healthbridgebackend.service.EhrAccessService;
import lk.gamage.backend.healthbridgebackend.service.MedicalRecordPdfService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/medical-records/pdf")
public class MedicalRecordPdfController {

    private final MedicalRecordPdfService
            medicalRecordPdfService;

    private final EhrAccessService
            ehrAccessService;


    public MedicalRecordPdfController(
            MedicalRecordPdfService medicalRecordPdfService,
            EhrAccessService ehrAccessService
    ) {

        this.medicalRecordPdfService =
                medicalRecordPdfService;

        this.ehrAccessService =
                ehrAccessService;
    }


    /*
     * =========================================================
     * DOWNLOAD PATIENT MEDICAL RECORD PDF
     * =========================================================
     *
     * PATIENT:
     * Can download own PDF only.
     *
     * DOCTOR:
     * Can download PDF only for a patient for whom
     * the logged-in doctor has created at least one
     * active MedicalRecord.
     */
    @GetMapping("/patient/{patientId}")
    @PreAuthorize(
            "hasAnyRole('PATIENT', 'DOCTOR')"
    )
    public ResponseEntity<byte[]>
    downloadPatientMedicalRecordPdf(

            @PathVariable
            String patientId,

            Authentication authentication
    ) {

        CustomUserDetails currentUser =
                (CustomUserDetails)
                        authentication
                                .getPrincipal();


        /*
         * =====================================================
         * PATIENT SECURITY
         * =====================================================
         *
         * Patient A cannot download Patient B PDF.
         */
        if (Role.PATIENT.equals(
                currentUser.getRole()
        )) {

            if (!ehrAccessService
                    .isCurrentPatient(
                            patientId,
                            authentication
                    )) {

                return ResponseEntity
                        .status(
                                HttpStatus.FORBIDDEN
                        )
                        .build();
            }
        }


        /*
         * =====================================================
         * DOCTOR SECURITY
         * =====================================================
         *
         * Doctor can download only patients that exist
         * in that doctor's Medical Record list.
         */
        if (Role.DOCTOR.equals(
                currentUser.getRole()
        )) {

            boolean allowed =
                    medicalRecordPdfService
                            .canDoctorDownloadPatientPdf(
                                    currentUser.getId(),
                                    patientId
                            );


            if (!allowed) {

                return ResponseEntity
                        .status(
                                HttpStatus.FORBIDDEN
                        )
                        .build();
            }
        }


        /*
         * Generate the detailed PDF.
         */
        byte[] pdf =
                medicalRecordPdfService
                        .generatePatientMedicalRecordPdf(
                                patientId,
                                currentUser.getId()
                        );


        /*
         * Safe filename.
         */
        String safePatientId =
                patientId.replaceAll(
                        "[^a-zA-Z0-9_-]",
                        "-"
                );


        String fileName =
                "healthbridge-medical-record-"
                        + safePatientId
                        + ".pdf";


        return ResponseEntity
                .ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\""
                                + fileName
                                + "\""
                )
                .contentType(
                        MediaType.APPLICATION_PDF
                )
                .contentLength(
                        pdf.length
                )
                .body(
                        pdf
                );
    }
}