package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.dto.response.MedicalRecordResponse;
import lk.gamage.backend.healthbridgebackend.exception.BadRequestException;
import lk.gamage.backend.healthbridgebackend.exception.ResourceNotFoundException;
import lk.gamage.backend.healthbridgebackend.model.MedicalRecord;
import lk.gamage.backend.healthbridgebackend.repository.MedicalRecordRepository;
import lk.gamage.backend.healthbridgebackend.security.CustomUserDetails;
import lk.gamage.backend.healthbridgebackend.service.MedicalRecordService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/medical-records")
public class DoctorMedicalRecordArchiveController {

    private final MedicalRecordRepository medicalRecordRepository;
    private final MedicalRecordService medicalRecordService;


    public DoctorMedicalRecordArchiveController(
            MedicalRecordRepository medicalRecordRepository,
            MedicalRecordService medicalRecordService
    ) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.medicalRecordService = medicalRecordService;
    }


    /*
     * DOCTOR ONLY.
     *
     * A doctor can archive only a Medical Record
     * created by that authenticated doctor.
     *
     * Admin / Super Admin keep using the existing endpoint:
     * PATCH /api/medical-records/{id}/archive
     */
    @PatchMapping("/{id}/archive-by-doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<MedicalRecordResponse>
    archiveOwnMedicalRecord(
            @PathVariable String id,
            Authentication authentication
    ) {

        if (!StringUtils.hasText(id)) {
            throw new BadRequestException(
                    "Medical record ID is required"
            );
        }

        CustomUserDetails currentDoctor =
                (CustomUserDetails) authentication.getPrincipal();

        MedicalRecord record = medicalRecordRepository
                .findById(id.trim())
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Medical record not found"
                        )
                );

        if (!StringUtils.hasText(currentDoctor.getId())
                || !currentDoctor.getId().equals(record.getDoctorId())) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }

        if (Boolean.TRUE.equals(record.getArchived())) {
            throw new BadRequestException(
                    "Medical record is already archived"
            );
        }

        return ResponseEntity.ok(
                medicalRecordService
                        .archiveMedicalRecord(
                                record.getId()
                        )
        );
    }
}