package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.dto.response.MedicalDocumentResponse;
import lk.gamage.backend.healthbridgebackend.exception.BadRequestException;
import lk.gamage.backend.healthbridgebackend.exception.ResourceNotFoundException;
import lk.gamage.backend.healthbridgebackend.model.MedicalDocument;
import lk.gamage.backend.healthbridgebackend.model.MedicalRecord;
import lk.gamage.backend.healthbridgebackend.repository.MedicalDocumentRepository;
import lk.gamage.backend.healthbridgebackend.repository.MedicalRecordRepository;
import lk.gamage.backend.healthbridgebackend.service.MedicalDocumentService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;


@RestController
@RequestMapping("/api/medical-documents")
public class MedicalDocumentRestoreController {

    private final MedicalDocumentRepository medicalDocumentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final MedicalDocumentService medicalDocumentService;


    public MedicalDocumentRestoreController(
            MedicalDocumentRepository medicalDocumentRepository,
            MedicalRecordRepository medicalRecordRepository,
            MedicalDocumentService medicalDocumentService
    ) {
        this.medicalDocumentRepository = medicalDocumentRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.medicalDocumentService = medicalDocumentService;
    }


    /*
     * ADMIN / SUPER ADMIN ONLY.
     *
     * Restores an individually archived document.
     * If its parent Medical Record is archived,
     * restore the parent record first.
     */
    @PatchMapping("/{id}/restore")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<MedicalDocumentResponse>
    restoreDocument(
            @PathVariable String id
    ) {

        if (!StringUtils.hasText(id)) {
            throw new BadRequestException(
                    "Medical document ID is required"
            );
        }

        MedicalDocument document = medicalDocumentRepository
                .findById(id.trim())
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Medical document not found"
                        )
                );

        if (!MedicalDocument.STATUS_ARCHIVED
                .equalsIgnoreCase(document.getStatus())) {

            throw new BadRequestException(
                    "Only archived medical documents can be restored"
            );
        }

        if (!StringUtils.hasText(
                document.getMedicalRecordId()
        )) {

            throw new BadRequestException(
                    "Medical document is not linked to a Medical Record"
            );
        }

        MedicalRecord parentRecord = medicalRecordRepository
                .findById(
                        document.getMedicalRecordId()
                )
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Parent Medical Record not found"
                        )
                );

        /*
         * An individually archived document
         * cannot become active while the
         * parent record is still archived.
         */
        if (Boolean.TRUE.equals(
                parentRecord.getArchived()
        )) {

            throw new BadRequestException(
                    "Restore the parent Medical Record before restoring this document"
            );
        }

        document.setStatus(
                MedicalDocument.STATUS_ACTIVE
        );

        document.setArchivedAt(
                null
        );

        document.setUpdatedAt(
                LocalDateTime.now()
        );

        medicalDocumentRepository.save(
                document
        );

        return ResponseEntity.ok(
                medicalDocumentService
                        .getDocumentById(
                                document.getId()
                        )
        );
    }
}