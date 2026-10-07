package lk.gamage.backend.healthbridgebackend.service.impl;

import lk.gamage.backend.healthbridgebackend.dto.request.MedicalRecordRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.MedicalRecordResponse;
import lk.gamage.backend.healthbridgebackend.exception.BadRequestException;
import lk.gamage.backend.healthbridgebackend.exception.ResourceNotFoundException;
import lk.gamage.backend.healthbridgebackend.model.MedicalDocument;
import lk.gamage.backend.healthbridgebackend.model.MedicalRecord;
import lk.gamage.backend.healthbridgebackend.repository.DiagnosisRepository;
import lk.gamage.backend.healthbridgebackend.repository.MedicalDocumentRepository;
import lk.gamage.backend.healthbridgebackend.repository.MedicalRecordRepository;
import lk.gamage.backend.healthbridgebackend.repository.TreatmentRecordRepository;
import lk.gamage.backend.healthbridgebackend.service.MedicalDocumentCloudinaryService;
import lk.gamage.backend.healthbridgebackend.service.MedicalRecordService;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Service
public class MedicalRecordServiceImpl
        implements MedicalRecordService {


    private final MedicalRecordRepository
            medicalRecordRepository;

    private final DiagnosisRepository
            diagnosisRepository;

    private final TreatmentRecordRepository
            treatmentRecordRepository;

    private final MedicalDocumentRepository
            medicalDocumentRepository;

    private final MedicalDocumentCloudinaryService
            medicalDocumentCloudinaryService;


    public MedicalRecordServiceImpl(
            MedicalRecordRepository medicalRecordRepository,
            DiagnosisRepository diagnosisRepository,
            TreatmentRecordRepository treatmentRecordRepository,
            MedicalDocumentRepository medicalDocumentRepository,
            MedicalDocumentCloudinaryService medicalDocumentCloudinaryService
    ) {

        this.medicalRecordRepository =
                medicalRecordRepository;

        this.diagnosisRepository =
                diagnosisRepository;

        this.treatmentRecordRepository =
                treatmentRecordRepository;

        this.medicalDocumentRepository =
                medicalDocumentRepository;

        this.medicalDocumentCloudinaryService =
                medicalDocumentCloudinaryService;
    }


    /*
     * ---------------------------------------------------------
     * CREATE MEDICAL RECORD
     * ---------------------------------------------------------
     */
    @Override
    public MedicalRecordResponse createMedicalRecord(
            MedicalRecordRequest request
    ) {

        MedicalRecord medicalRecord =
                new MedicalRecord();


        copyRequestToEntity(
                request,
                medicalRecord
        );


        LocalDateTime now =
                LocalDateTime.now();


        medicalRecord.setCreatedAt(
                now
        );


        medicalRecord.setUpdatedAt(
                now
        );


        medicalRecord.setVersion(
                1
        );


        medicalRecord.setArchived(
                false
        );


        medicalRecord.setArchivedAt(
                null
        );


        if (request.getStatus() == null
                || request.getStatus().isBlank()) {

            medicalRecord.setStatus(
                    "COMPLETED"
            );
        }


        MedicalRecord savedRecord =
                medicalRecordRepository.save(
                        medicalRecord
                );


        return toResponse(
                savedRecord
        );
    }


    /*
     * ---------------------------------------------------------
     * GET ALL ACTIVE RECORDS
     * ---------------------------------------------------------
     */
    @Override
    public List<MedicalRecordResponse>
    getAllMedicalRecords() {

        return medicalRecordRepository
                .findAllByOrderByVisitDateDesc()
                .stream()
                .filter(this::isActive)
                .map(this::toResponse)
                .toList();
    }


    /*
     * ---------------------------------------------------------
     * GET ACTIVE RECORD BY ID
     * ---------------------------------------------------------
     */
    @Override
    public MedicalRecordResponse
    getMedicalRecordById(
            String id
    ) {

        MedicalRecord medicalRecord =
                findRecordById(
                        id
                );


        if (!isActive(
                medicalRecord
        )) {

            throw new ResourceNotFoundException(
                    "Medical record not found or archived"
            );
        }


        return toResponse(
                medicalRecord
        );
    }


    /*
     * ---------------------------------------------------------
     * GET ACTIVE RECORDS BY PATIENT
     * ---------------------------------------------------------
     */
    @Override
    public List<MedicalRecordResponse>
    getMedicalRecordsByPatientId(
            String patientId
    ) {

        if (!StringUtils.hasText(
                patientId
        )) {

            throw new BadRequestException(
                    "Patient ID is required"
            );
        }


        return medicalRecordRepository
                .findByPatientIdOrderByVisitDateDesc(
                        patientId.trim()
                )
                .stream()
                .filter(this::isActive)
                .map(this::toResponse)
                .toList();
    }


    /*
     * ---------------------------------------------------------
     * GET ACTIVE RECORDS BY DOCTOR
     * ---------------------------------------------------------
     */
    @Override
    public List<MedicalRecordResponse>
    getMedicalRecordsByDoctorId(
            String doctorId
    ) {

        if (!StringUtils.hasText(
                doctorId
        )) {

            throw new BadRequestException(
                    "Doctor ID is required"
            );
        }


        return medicalRecordRepository
                .findByDoctorIdOrderByVisitDateDesc(
                        doctorId.trim()
                )
                .stream()
                .filter(this::isActive)
                .map(this::toResponse)
                .toList();
    }


    /*
     * ---------------------------------------------------------
     * UPDATE MEDICAL RECORD
     * ---------------------------------------------------------
     */
    @Override
    public MedicalRecordResponse
    updateMedicalRecord(
            String id,
            MedicalRecordRequest request
    ) {

        MedicalRecord existingRecord =
                findRecordById(
                        id
                );


        if (!isActive(
                existingRecord
        )) {

            throw new BadRequestException(
                    "Archived medical record cannot be updated. Restore it first."
            );
        }


        copyRequestToEntity(
                request,
                existingRecord
        );


        existingRecord.setUpdatedAt(
                LocalDateTime.now()
        );


        existingRecord.setVersion(
                getNextVersion(
                        existingRecord
                )
        );


        if (request.getStatus() == null
                || request.getStatus().isBlank()) {

            existingRecord.setStatus(
                    "COMPLETED"
            );
        }


        MedicalRecord updatedRecord =
                medicalRecordRepository.save(
                        existingRecord
                );


        return toResponse(
                updatedRecord
        );
    }


    /*
     * ---------------------------------------------------------
     * ARCHIVE
     * ---------------------------------------------------------
     */
    @Override
    public MedicalRecordResponse
    archiveMedicalRecord(
            String id
    ) {

        MedicalRecord existingRecord =
                findRecordById(
                        id
                );


        if (Boolean.TRUE.equals(
                existingRecord.getArchived()
        )) {

            throw new BadRequestException(
                    "Medical record is already archived"
            );
        }


        LocalDateTime now =
                LocalDateTime.now();


        existingRecord.setArchived(
                true
        );


        existingRecord.setArchivedAt(
                now
        );


        existingRecord.setUpdatedAt(
                now
        );


        existingRecord.setVersion(
                getNextVersion(
                        existingRecord
                )
        );


        MedicalRecord archivedRecord =
                medicalRecordRepository.save(
                        existingRecord
                );


        return toResponse(
                archivedRecord
        );
    }


    /*
     * ---------------------------------------------------------
     * RESTORE
     * ---------------------------------------------------------
     */
    @Override
    public MedicalRecordResponse
    restoreMedicalRecord(
            String id
    ) {

        MedicalRecord existingRecord =
                findRecordById(
                        id
                );


        if (!Boolean.TRUE.equals(
                existingRecord.getArchived()
        )) {

            throw new BadRequestException(
                    "Medical record is not archived"
            );
        }


        LocalDateTime now =
                LocalDateTime.now();


        existingRecord.setArchived(
                false
        );


        existingRecord.setArchivedAt(
                null
        );


        existingRecord.setUpdatedAt(
                now
        );


        existingRecord.setVersion(
                getNextVersion(
                        existingRecord
                )
        );


        MedicalRecord restoredRecord =
                medicalRecordRepository.save(
                        existingRecord
                );


        return toResponse(
                restoredRecord
        );
    }


    /*
     * ---------------------------------------------------------
     * GET ARCHIVED RECORDS
     * ---------------------------------------------------------
     */
    @Override
    public List<MedicalRecordResponse>
    getArchivedMedicalRecords() {

        return medicalRecordRepository
                .findAllByOrderByVisitDateDesc()
                .stream()
                .filter(
                        record ->
                                Boolean.TRUE.equals(
                                        record.getArchived()
                                )
                )
                .map(this::toResponse)
                .toList();
    }


    /*
     * ---------------------------------------------------------
     * PERMANENT DELETE
     * ---------------------------------------------------------
     *
     * IMPORTANT:
     *
     * Only an ARCHIVED MedicalRecord can be
     * permanently deleted.
     *
     * Related data is removed as well:
     *
     * - Cloudinary medical document files
     * - medical_documents metadata
     * - diagnoses
     * - treatment_records
     * - medical_records parent
     *
     * This prevents orphan child records.
     */
    @Override
    public void deleteMedicalRecordPermanently(
            String id
    ) {

        MedicalRecord existingRecord =
                findRecordById(
                        id
                );


        /*
         * Safety rule:
         * ACTIVE record cannot be permanently deleted.
         */
        if (!Boolean.TRUE.equals(
                existingRecord.getArchived()
        )) {

            throw new BadRequestException(
                    "Medical record must be archived before permanent deletion"
            );
        }


        /*
         * -----------------------------------------------------
         * STEP 1
         * Get ALL MedicalDocument versions belonging
         * to this MedicalRecord.
         *
         * This includes:
         * ACTIVE
         * SUPERSEDED
         * ARCHIVED
         * -----------------------------------------------------
         */
        List<MedicalDocument> medicalDocuments =
                medicalDocumentRepository
                        .findByMedicalRecordIdOrderByUploadedAtDesc(
                                existingRecord.getId()
                        );


        /*
         * -----------------------------------------------------
         * STEP 2
         * Remove actual files from Cloudinary first.
         *
         * If Cloudinary throws an exception,
         * database deletion below will not continue.
         * -----------------------------------------------------
         */
        for (MedicalDocument document
                : medicalDocuments) {

            medicalDocumentCloudinaryService
                    .deleteMedicalDocument(
                            document.getCloudinaryPublicId(),
                            document.getCloudinaryResourceType()
                    );
        }


        /*
         * -----------------------------------------------------
         * STEP 3
         * Delete MedicalDocument metadata.
         * -----------------------------------------------------
         */
        if (!medicalDocuments.isEmpty()) {

            medicalDocumentRepository
                    .deleteAll(
                            medicalDocuments
                    );
        }


        /*
         * -----------------------------------------------------
         * STEP 4
         * Delete diagnoses linked to MedicalRecord.
         * -----------------------------------------------------
         */
        var diagnoses =
                diagnosisRepository
                        .findByMedicalRecordId(
                                existingRecord.getId()
                        );


        if (!diagnoses.isEmpty()) {

            diagnosisRepository
                    .deleteAll(
                            diagnoses
                    );
        }


        /*
         * -----------------------------------------------------
         * STEP 5
         * Delete treatments linked to MedicalRecord.
         * -----------------------------------------------------
         */
        var treatments =
                treatmentRecordRepository
                        .findByMedicalRecordId(
                                existingRecord.getId()
                        );


        if (!treatments.isEmpty()) {

            treatmentRecordRepository
                    .deleteAll(
                            treatments
                    );
        }


        /*
         * -----------------------------------------------------
         * STEP 6
         * Finally delete parent MedicalRecord.
         * -----------------------------------------------------
         */
        medicalRecordRepository.delete(
                existingRecord
        );
    }


    /*
     * ---------------------------------------------------------
     * ACTIVE CHECK
     * ---------------------------------------------------------
     */
    private boolean isActive(
            MedicalRecord medicalRecord
    ) {

        return !Boolean.TRUE.equals(
                medicalRecord.getArchived()
        );
    }


    /*
     * ---------------------------------------------------------
     * FIND MEDICAL RECORD
     * ---------------------------------------------------------
     */
    private MedicalRecord findRecordById(
            String id
    ) {

        if (!StringUtils.hasText(
                id
        )) {

            throw new BadRequestException(
                    "Medical record ID is required"
            );
        }


        return medicalRecordRepository
                .findById(
                        id
                )
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "Medical record not found"
                                )
                );
    }


    /*
     * ---------------------------------------------------------
     * SAFE VERSION INCREMENT
     * ---------------------------------------------------------
     */
    private int getNextVersion(
        MedicalRecord medicalRecord
) {

    if (medicalRecord.getVersion() < 1) {
        return 1;
    }

    return medicalRecord.getVersion() + 1;
}

    /*
     * ---------------------------------------------------------
     * REQUEST → ENTITY
     * ---------------------------------------------------------
     */
    private void copyRequestToEntity(
            MedicalRecordRequest request,
            MedicalRecord medicalRecord
    ) {

        medicalRecord.setPatientId(
                request.getPatientId()
        );


        medicalRecord.setDoctorId(
                request.getDoctorId()
        );


        medicalRecord.setDoctorName(
                request.getDoctorName()
        );


        medicalRecord.setHospitalName(
                request.getHospitalName()
        );


        medicalRecord.setVisitDate(
                request.getVisitDate()
        );


        medicalRecord.setRecordType(
                request.getRecordType()
        );


        medicalRecord.setDiagnosis(
                request.getDiagnosis()
        );


        medicalRecord.setClinicalSummary(
                request.getClinicalSummary()
        );


        if (request.getSymptoms() == null) {

            medicalRecord.setSymptoms(
                    new ArrayList<>()
            );

        } else {

            medicalRecord.setSymptoms(
                    new ArrayList<>(
                            request.getSymptoms()
                    )
            );
        }


        if (request.getTreatmentPlan() == null) {

            medicalRecord.setTreatmentPlan(
                    new ArrayList<>()
            );

        } else {

            medicalRecord.setTreatmentPlan(
                    new ArrayList<>(
                            request.getTreatmentPlan()
                    )
            );
        }


        medicalRecord.setConsultationNotes(
                request.getConsultationNotes()
        );


        medicalRecord.setStatus(
                request.getStatus()
        );
    }


    /*
     * ---------------------------------------------------------
     * ENTITY → RESPONSE
     * ---------------------------------------------------------
     */
    private MedicalRecordResponse toResponse(
            MedicalRecord medicalRecord
    ) {

        MedicalRecordResponse response =
                new MedicalRecordResponse();


        response.setId(
                medicalRecord.getId()
        );


        response.setPatientId(
                medicalRecord.getPatientId()
        );


        response.setDoctorId(
                medicalRecord.getDoctorId()
        );


        response.setDoctorName(
                medicalRecord.getDoctorName()
        );


        response.setHospitalName(
                medicalRecord.getHospitalName()
        );


        response.setVisitDate(
                medicalRecord.getVisitDate()
        );


        response.setRecordType(
                medicalRecord.getRecordType()
        );


        response.setDiagnosis(
                medicalRecord.getDiagnosis()
        );


        response.setClinicalSummary(
                medicalRecord.getClinicalSummary()
        );


        response.setSymptoms(
                medicalRecord.getSymptoms()
        );


        response.setTreatmentPlan(
                medicalRecord.getTreatmentPlan()
        );


        response.setConsultationNotes(
                medicalRecord.getConsultationNotes()
        );


        response.setStatus(
                medicalRecord.getStatus()
        );


        response.setVersion(
                medicalRecord.getVersion()
        );


        response.setCreatedAt(
                medicalRecord.getCreatedAt()
        );


        response.setUpdatedAt(
                medicalRecord.getUpdatedAt()
        );


        response.setArchived(
                Boolean.TRUE.equals(
                        medicalRecord.getArchived()
                )
        );


        response.setArchivedAt(
                medicalRecord.getArchivedAt()
        );


        return response;
    }
}