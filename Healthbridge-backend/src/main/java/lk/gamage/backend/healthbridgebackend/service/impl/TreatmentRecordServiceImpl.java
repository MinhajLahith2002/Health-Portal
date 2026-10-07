package lk.gamage.backend.healthbridgebackend.service.impl;

import lk.gamage.backend.healthbridgebackend.dto.request.TreatmentRecordRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.TreatmentRecordResponse;
import lk.gamage.backend.healthbridgebackend.exception.BadRequestException;
import lk.gamage.backend.healthbridgebackend.exception.ResourceNotFoundException;
import lk.gamage.backend.healthbridgebackend.model.MedicalRecord;
import lk.gamage.backend.healthbridgebackend.model.TreatmentRecord;
import lk.gamage.backend.healthbridgebackend.repository.MedicalRecordRepository;
import lk.gamage.backend.healthbridgebackend.repository.TreatmentRecordRepository;
import lk.gamage.backend.healthbridgebackend.service.TreatmentRecordService;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Objects;


@Service
public class TreatmentRecordServiceImpl
        implements TreatmentRecordService {


    private final TreatmentRecordRepository
            treatmentRecordRepository;

    private final MedicalRecordRepository
            medicalRecordRepository;


    public TreatmentRecordServiceImpl(
            TreatmentRecordRepository treatmentRecordRepository,
            MedicalRecordRepository medicalRecordRepository
    ) {

        this.treatmentRecordRepository =
                treatmentRecordRepository;

        this.medicalRecordRepository =
                medicalRecordRepository;
    }


    /*
     * ---------------------------------------------------------
     * CREATE
     * ---------------------------------------------------------
     */
    @Override
    public TreatmentRecordResponse createTreatment(
            TreatmentRecordRequest request
    ) {

        validateTreatmentRequest(
                request
        );


        TreatmentRecord treatmentRecord =
                new TreatmentRecord();


        mapRequestToEntity(
                request,
                treatmentRecord
        );


        TreatmentRecord savedTreatment =
                treatmentRecordRepository.save(
                        treatmentRecord
                );


        return mapToResponse(
                savedTreatment
        );
    }


    /*
     * ---------------------------------------------------------
     * GET ALL
     * ---------------------------------------------------------
     */
    @Override
    public List<TreatmentRecordResponse>
    getAllTreatments() {

        return treatmentRecordRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    /*
     * ---------------------------------------------------------
     * GET BY ID
     * ---------------------------------------------------------
     */
    @Override
    public TreatmentRecordResponse
    getTreatmentById(
            String id
    ) {

        TreatmentRecord treatmentRecord =
                findTreatmentById(
                        id
                );


        return mapToResponse(
                treatmentRecord
        );
    }


    /*
     * ---------------------------------------------------------
     * GET BY MEDICAL RECORD
     * ---------------------------------------------------------
     */
    @Override
    public List<TreatmentRecordResponse>
    getTreatmentsByMedicalRecord(
            String medicalRecordId
    ) {

        if (!StringUtils.hasText(
                medicalRecordId
        )) {

            throw new BadRequestException(
                    "Medical record ID is required"
            );
        }


        return treatmentRecordRepository
                .findByMedicalRecordId(
                        medicalRecordId
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    /*
     * ---------------------------------------------------------
     * GET BY PATIENT
     * ---------------------------------------------------------
     *
     * Useful for:
     * - Patient EHR
     * - Patient medical history
     * - Patient timeline
     */
    @Override
    public List<TreatmentRecordResponse>
    getTreatmentsByPatient(
            String patientId
    ) {

        if (!StringUtils.hasText(
                patientId
        )) {

            throw new BadRequestException(
                    "Patient ID is required"
            );
        }


        return treatmentRecordRepository
                .findByPatientId(
                        patientId
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    /*
     * ---------------------------------------------------------
     * GET BY DOCTOR
     * ---------------------------------------------------------
     *
     * Useful for doctor treatment history/activity.
     */
    @Override
    public List<TreatmentRecordResponse>
    getTreatmentsByDoctor(
            String doctorId
    ) {

        if (!StringUtils.hasText(
                doctorId
        )) {

            throw new BadRequestException(
                    "Doctor ID is required"
            );
        }


        return treatmentRecordRepository
                .findByDoctorId(
                        doctorId
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    /*
     * ---------------------------------------------------------
     * UPDATE
     * ---------------------------------------------------------
     */
    @Override
    public TreatmentRecordResponse
    updateTreatment(
            String id,
            TreatmentRecordRequest request
    ) {

        TreatmentRecord existingTreatment =
                findTreatmentById(
                        id
                );


        validateTreatmentRequest(
                request
        );


        mapRequestToEntity(
                request,
                existingTreatment
        );


        TreatmentRecord updatedTreatment =
                treatmentRecordRepository.save(
                        existingTreatment
                );


        return mapToResponse(
                updatedTreatment
        );
    }


    /*
     * ---------------------------------------------------------
     * DELETE
     * ---------------------------------------------------------
     */
    @Override
    public void deleteTreatment(
            String id
    ) {

        TreatmentRecord treatmentRecord =
                findTreatmentById(
                        id
                );


        treatmentRecordRepository.delete(
                treatmentRecord
        );
    }


    /*
     * ---------------------------------------------------------
     * COMPLETE VALIDATION
     * ---------------------------------------------------------
     */
    private void validateTreatmentRequest(
            TreatmentRecordRequest request
    ) {

        validateMedicalRecordRelationship(
                request
        );


        validateTreatmentDates(
                request
        );
    }


    /*
     * ---------------------------------------------------------
     * MEDICAL RECORD RELATIONSHIP VALIDATION
     * ---------------------------------------------------------
     */
    private void validateMedicalRecordRelationship(
            TreatmentRecordRequest request
    ) {

        MedicalRecord medicalRecord =
                medicalRecordRepository
                        .findById(
                                request.getMedicalRecordId()
                        )
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Medical record not found"
                                        )
                        );


        if (Boolean.TRUE.equals(
                medicalRecord.getArchived()
        )) {

            throw new BadRequestException(
                    "Cannot add or update a treatment for an archived medical record"
            );
        }


        if (!Objects.equals(
                medicalRecord.getPatientId(),
                request.getPatientId()
        )) {

            throw new BadRequestException(
                    "Patient ID does not match the medical record"
            );
        }
    }


    /*
     * ---------------------------------------------------------
     * DATE VALIDATION
     * ---------------------------------------------------------
     */
    private void validateTreatmentDates(
            TreatmentRecordRequest request
    ) {

        if (request.getStartDate() != null
                && request.getEndDate() != null
                && request.getEndDate()
                .isBefore(
                        request.getStartDate()
                )) {

            throw new BadRequestException(
                    "Treatment end date cannot be before start date"
            );
        }
    }


    /*
     * ---------------------------------------------------------
     * FIND BY ID
     * ---------------------------------------------------------
     */
    private TreatmentRecord findTreatmentById(
            String id
    ) {

        if (!StringUtils.hasText(id)) {

            throw new BadRequestException(
                    "Treatment record ID is required"
            );
        }


        return treatmentRecordRepository
                .findById(id)
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "Treatment record not found"
                                )
                );
    }


    /*
     * ---------------------------------------------------------
     * REQUEST → ENTITY
     * ---------------------------------------------------------
     */
    private void mapRequestToEntity(
            TreatmentRecordRequest request,
            TreatmentRecord treatmentRecord
    ) {

        treatmentRecord.setMedicalRecordId(
                request.getMedicalRecordId()
        );


        treatmentRecord.setPatientId(
                request.getPatientId()
        );


        treatmentRecord.setDoctorId(
                request.getDoctorId()
        );


        treatmentRecord.setTreatmentType(
                request.getTreatmentType()
        );


        treatmentRecord.setDescription(
                request.getDescription()
        );


        treatmentRecord.setStartDate(
                request.getStartDate()
        );


        treatmentRecord.setEndDate(
                request.getEndDate()
        );


        treatmentRecord.setStatus(
                request.getStatus()
        );
    }


    /*
     * ---------------------------------------------------------
     * ENTITY → RESPONSE
     * ---------------------------------------------------------
     */
    private TreatmentRecordResponse mapToResponse(
            TreatmentRecord treatmentRecord
    ) {

        TreatmentRecordResponse response =
                new TreatmentRecordResponse();


        response.setId(
                treatmentRecord.getId()
        );


        response.setMedicalRecordId(
                treatmentRecord.getMedicalRecordId()
        );


        response.setPatientId(
                treatmentRecord.getPatientId()
        );


        response.setDoctorId(
                treatmentRecord.getDoctorId()
        );


        response.setTreatmentType(
                treatmentRecord.getTreatmentType()
        );


        response.setDescription(
                treatmentRecord.getDescription()
        );


        response.setStartDate(
                treatmentRecord.getStartDate()
        );


        response.setEndDate(
                treatmentRecord.getEndDate()
        );


        response.setStatus(
                treatmentRecord.getStatus()
        );


        return response;
    }
}