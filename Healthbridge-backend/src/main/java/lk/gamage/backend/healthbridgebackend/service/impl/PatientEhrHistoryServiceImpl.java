package lk.gamage.backend.healthbridgebackend.service.impl;

import lk.gamage.backend.healthbridgebackend.dto.response.DiagnosisResponse;
import lk.gamage.backend.healthbridgebackend.dto.response.MedicalDocumentResponse;
import lk.gamage.backend.healthbridgebackend.dto.response.MedicalRecordResponse;
import lk.gamage.backend.healthbridgebackend.dto.response.PatientEhrHistoryResponse;
import lk.gamage.backend.healthbridgebackend.dto.response.TreatmentRecordResponse;
import lk.gamage.backend.healthbridgebackend.exception.BadRequestException;
import lk.gamage.backend.healthbridgebackend.service.DiagnosisService;
import lk.gamage.backend.healthbridgebackend.service.MedicalDocumentService;
import lk.gamage.backend.healthbridgebackend.service.MedicalRecordService;
import lk.gamage.backend.healthbridgebackend.service.PatientEhrHistoryService;
import lk.gamage.backend.healthbridgebackend.service.TreatmentRecordService;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;


@Service
public class PatientEhrHistoryServiceImpl
        implements PatientEhrHistoryService {


    private final MedicalRecordService
            medicalRecordService;

    private final DiagnosisService
            diagnosisService;

    private final TreatmentRecordService
            treatmentRecordService;

    private final MedicalDocumentService
            medicalDocumentService;


    public PatientEhrHistoryServiceImpl(
            MedicalRecordService medicalRecordService,
            DiagnosisService diagnosisService,
            TreatmentRecordService treatmentRecordService,
            MedicalDocumentService medicalDocumentService
    ) {

        this.medicalRecordService =
                medicalRecordService;

        this.diagnosisService =
                diagnosisService;

        this.treatmentRecordService =
                treatmentRecordService;

        this.medicalDocumentService =
                medicalDocumentService;
    }


    @Override
    public PatientEhrHistoryResponse
    getPatientEhrHistory(
            String patientId
    ) {

        if (!StringUtils.hasText(
                patientId
        )) {

            throw new BadRequestException(
                    "Patient ID is required"
            );
        }


        String normalizedPatientId =
                patientId.trim();


        /*
         * MedicalRecordService already returns
         * active/non-archived records only.
         */
        List<MedicalRecordResponse> medicalRecords =
                medicalRecordService
                        .getMedicalRecordsByPatientId(
                                normalizedPatientId
                        );


        /*
         * Collect active MedicalRecord IDs.
         *
         * Child entities linked to archived records
         * must not appear in the normal active EHR.
         */
        Set<String> activeMedicalRecordIds =
                medicalRecords
                        .stream()
                        .map(
                                MedicalRecordResponse::getId
                        )
                        .collect(
                                Collectors.toSet()
                        );


        /*
         * -----------------------------------------------------
         * DIAGNOSES
         * -----------------------------------------------------
         *
         * DiagnosisService returns patient diagnoses.
         * We additionally filter by active MedicalRecord IDs.
         */
        List<DiagnosisResponse> diagnoses =
                diagnosisService
                        .getDiagnosesByPatient(
                                normalizedPatientId
                        )
                        .stream()
                        .filter(
                                diagnosis ->
                                        activeMedicalRecordIds
                                                .contains(
                                                        diagnosis
                                                                .getMedicalRecordId()
                                                )
                        )
                        .sorted(
                                Comparator.comparing(
                                        DiagnosisResponse::getDiagnosedDate,
                                        Comparator.nullsLast(
                                                Comparator.reverseOrder()
                                        )
                                )
                        )
                        .toList();


        /*
         * -----------------------------------------------------
         * TREATMENTS
         * -----------------------------------------------------
         */
        List<TreatmentRecordResponse> treatments =
                treatmentRecordService
                        .getTreatmentsByPatient(
                                normalizedPatientId
                        )
                        .stream()
                        .filter(
                                treatment ->
                                        activeMedicalRecordIds
                                                .contains(
                                                        treatment
                                                                .getMedicalRecordId()
                                                )
                        )
                        .sorted(
                                Comparator.comparing(
                                        TreatmentRecordResponse::getStartDate,
                                        Comparator.nullsLast(
                                                Comparator.reverseOrder()
                                        )
                                )
                        )
                        .toList();


        /*
         * -----------------------------------------------------
         * MEDICAL DOCUMENTS
         * -----------------------------------------------------
         *
         * MedicalDocumentService already returns ACTIVE
         * document versions only.
         *
         * We also filter out documents whose parent
         * MedicalRecord has been archived.
         */
        List<MedicalDocumentResponse> documents =
                medicalDocumentService
                        .getDocumentsByPatient(
                                normalizedPatientId
                        )
                        .stream()
                        .filter(
                                document ->
                                        activeMedicalRecordIds
                                                .contains(
                                                        document
                                                                .getMedicalRecordId()
                                                )
                        )
                        .sorted(
                                Comparator.comparing(
                                        MedicalDocumentResponse::getUploadedAt,
                                        Comparator.nullsLast(
                                                Comparator.reverseOrder()
                                        )
                                )
                        )
                        .toList();


        /*
         * -----------------------------------------------------
         * BUILD SINGLE EHR RESPONSE
         * -----------------------------------------------------
         */
        PatientEhrHistoryResponse response =
                new PatientEhrHistoryResponse();


        response.setPatientId(
                normalizedPatientId
        );


        response.setGeneratedAt(
                LocalDateTime.now()
        );


        response.setMedicalRecords(
                medicalRecords
        );


        response.setDiagnoses(
                diagnoses
        );


        response.setTreatments(
                treatments
        );


        response.setDocuments(
                documents
        );


        return response;
    }
}