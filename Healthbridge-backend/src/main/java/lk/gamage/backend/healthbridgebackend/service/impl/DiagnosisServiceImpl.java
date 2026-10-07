package lk.gamage.backend.healthbridgebackend.service.impl;

import lk.gamage.backend.healthbridgebackend.dto.request.DiagnosisRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.DiagnosisResponse;
import lk.gamage.backend.healthbridgebackend.exception.BadRequestException;
import lk.gamage.backend.healthbridgebackend.exception.ResourceNotFoundException;
import lk.gamage.backend.healthbridgebackend.model.Diagnosis;
import lk.gamage.backend.healthbridgebackend.model.MedicalRecord;
import lk.gamage.backend.healthbridgebackend.repository.DiagnosisRepository;
import lk.gamage.backend.healthbridgebackend.repository.MedicalRecordRepository;
import lk.gamage.backend.healthbridgebackend.service.DiagnosisService;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Objects;


@Service
public class DiagnosisServiceImpl
        implements DiagnosisService {


    private final DiagnosisRepository diagnosisRepository;

    private final MedicalRecordRepository medicalRecordRepository;


    public DiagnosisServiceImpl(
            DiagnosisRepository diagnosisRepository,
            MedicalRecordRepository medicalRecordRepository
    ) {

        this.diagnosisRepository =
                diagnosisRepository;

        this.medicalRecordRepository =
                medicalRecordRepository;
    }


    @Override
    public DiagnosisResponse createDiagnosis(
            DiagnosisRequest request
    ) {

        validateMedicalRecordRelationship(
                request
        );


        Diagnosis diagnosis =
                new Diagnosis();


        mapRequestToEntity(
                request,
                diagnosis
        );


        Diagnosis savedDiagnosis =
                diagnosisRepository.save(
                        diagnosis
                );


        return mapToResponse(
                savedDiagnosis
        );
    }


    @Override
    public List<DiagnosisResponse>
    getAllDiagnoses() {

        return diagnosisRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    @Override
    public DiagnosisResponse
    getDiagnosisById(
            String id
    ) {

        Diagnosis diagnosis =
                findDiagnosisById(
                        id
                );


        return mapToResponse(
                diagnosis
        );
    }


    @Override
    public List<DiagnosisResponse>
    getDiagnosesByMedicalRecord(
            String medicalRecordId
    ) {

        if (!StringUtils.hasText(
                medicalRecordId
        )) {

            throw new BadRequestException(
                    "Medical record ID is required"
            );
        }


        return diagnosisRepository
                .findByMedicalRecordId(
                        medicalRecordId
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    /*
     * ---------------------------------------------------------
     * GET DIAGNOSES BY PATIENT
     * ---------------------------------------------------------
     *
     * Useful for:
     * - Patient EHR
     * - Patient medical history
     * - EHR timeline
     */
    @Override
    public List<DiagnosisResponse>
    getDiagnosesByPatient(
            String patientId
    ) {

        if (!StringUtils.hasText(
                patientId
        )) {

            throw new BadRequestException(
                    "Patient ID is required"
            );
        }


        return diagnosisRepository
                .findByPatientId(
                        patientId
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    /*
     * ---------------------------------------------------------
     * GET DIAGNOSES BY DOCTOR
     * ---------------------------------------------------------
     *
     * Useful for doctor activity/history.
     */
    @Override
    public List<DiagnosisResponse>
    getDiagnosesByDoctor(
            String doctorId
    ) {

        if (!StringUtils.hasText(
                doctorId
        )) {

            throw new BadRequestException(
                    "Doctor ID is required"
            );
        }


        return diagnosisRepository
                .findByDoctorId(
                        doctorId
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    @Override
    public DiagnosisResponse updateDiagnosis(
            String id,
            DiagnosisRequest request
    ) {

        Diagnosis diagnosis =
                findDiagnosisById(
                        id
                );


        validateMedicalRecordRelationship(
                request
        );


        mapRequestToEntity(
                request,
                diagnosis
        );


        Diagnosis updatedDiagnosis =
                diagnosisRepository.save(
                        diagnosis
                );


        return mapToResponse(
                updatedDiagnosis
        );
    }


    @Override
    public void deleteDiagnosis(
            String id
    ) {

        Diagnosis diagnosis =
                findDiagnosisById(
                        id
                );


        diagnosisRepository.delete(
                diagnosis
        );
    }


    /*
     * ---------------------------------------------------------
     * MEDICAL RECORD RELATIONSHIP VALIDATION
     * ---------------------------------------------------------
     */
    private void validateMedicalRecordRelationship(
            DiagnosisRequest request
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
                    "Cannot add or update a diagnosis for an archived medical record"
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


    private Diagnosis findDiagnosisById(
            String id
    ) {

        if (!StringUtils.hasText(id)) {

            throw new BadRequestException(
                    "Diagnosis ID is required"
            );
        }


        return diagnosisRepository
                .findById(id)
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "Diagnosis not found"
                                )
                );
    }


    private void mapRequestToEntity(
            DiagnosisRequest request,
            Diagnosis diagnosis
    ) {

        diagnosis.setMedicalRecordId(
                request.getMedicalRecordId()
        );


        diagnosis.setPatientId(
                request.getPatientId()
        );


        diagnosis.setDoctorId(
                request.getDoctorId()
        );


        diagnosis.setDiagnosisName(
                request.getDiagnosisName()
        );


        diagnosis.setDescription(
                request.getDescription()
        );


        diagnosis.setSeverity(
                request.getSeverity()
        );


        diagnosis.setDiagnosedDate(
                request.getDiagnosedDate()
        );
    }


    private DiagnosisResponse mapToResponse(
            Diagnosis diagnosis
    ) {

        DiagnosisResponse response =
                new DiagnosisResponse();


        response.setId(
                diagnosis.getId()
        );


        response.setMedicalRecordId(
                diagnosis.getMedicalRecordId()
        );


        response.setPatientId(
                diagnosis.getPatientId()
        );


        response.setDoctorId(
                diagnosis.getDoctorId()
        );


        response.setDiagnosisName(
                diagnosis.getDiagnosisName()
        );


        response.setDescription(
                diagnosis.getDescription()
        );


        response.setSeverity(
                diagnosis.getSeverity()
        );


        response.setDiagnosedDate(
                diagnosis.getDiagnosedDate()
        );


        return response;
    }
}