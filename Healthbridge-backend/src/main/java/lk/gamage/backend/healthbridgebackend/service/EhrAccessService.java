package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.model.Diagnosis;
import lk.gamage.backend.healthbridgebackend.model.MedicalDocument;
import lk.gamage.backend.healthbridgebackend.model.Role;
import lk.gamage.backend.healthbridgebackend.model.TreatmentRecord;
import lk.gamage.backend.healthbridgebackend.model.User;

import lk.gamage.backend.healthbridgebackend.repository.DiagnosisRepository;
import lk.gamage.backend.healthbridgebackend.repository.MedicalDocumentRepository;
import lk.gamage.backend.healthbridgebackend.repository.MedicalRecordRepository;
import lk.gamage.backend.healthbridgebackend.repository.TreatmentRecordRepository;
import lk.gamage.backend.healthbridgebackend.repository.UserRepository;

import lk.gamage.backend.healthbridgebackend.security.CustomUserDetails;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;


@Service("ehrAccessService")
public class EhrAccessService {


    private final MedicalRecordRepository
            medicalRecordRepository;

    private final DiagnosisRepository
            diagnosisRepository;

    private final TreatmentRecordRepository
            treatmentRecordRepository;

    private final MedicalDocumentRepository
            medicalDocumentRepository;

    private final UserRepository
            userRepository;


    public EhrAccessService(
            MedicalRecordRepository medicalRecordRepository,
            DiagnosisRepository diagnosisRepository,
            TreatmentRecordRepository treatmentRecordRepository,
            MedicalDocumentRepository medicalDocumentRepository,
            UserRepository userRepository
    ) {

        this.medicalRecordRepository =
                medicalRecordRepository;

        this.diagnosisRepository =
                diagnosisRepository;

        this.treatmentRecordRepository =
                treatmentRecordRepository;

        this.medicalDocumentRepository =
                medicalDocumentRepository;

        this.userRepository =
                userRepository;
    }


    /*
     * =========================================================
     * COMMON PATIENT / DOCTOR SECURITY
     * =========================================================
     */


    public boolean isCurrentPatient(
            String patientId,
            Authentication authentication
    ) {

        CustomUserDetails user =
                getCurrentUser(authentication);


        return user != null
                && Role.PATIENT.equals(user.getRole())
                && StringUtils.hasText(patientId)
                && user.getId().equals(
                        patientId.trim()
                );
    }


    public boolean isCurrentDoctor(
            String doctorId,
            Authentication authentication
    ) {

        CustomUserDetails user =
                getCurrentUser(authentication);


        return user != null
                && Role.DOCTOR.equals(user.getRole())
                && StringUtils.hasText(doctorId)
                && user.getId().equals(
                        doctorId.trim()
                );
    }


    public boolean isValidPatient(
            String patientId
    ) {

        if (!StringUtils.hasText(patientId)) {

            return false;
        }


        return userRepository
                .findById(
                        patientId.trim()
                )
                .map(User::getRole)
                .map(role ->
                        Role.PATIENT.equals(role)
                )
                .orElse(false);
    }


    /*
     * =========================================================
     * MEDICAL RECORD SECURITY
     * =========================================================
     */


    public boolean canPatientAccessMedicalRecord(
            String medicalRecordId,
            Authentication authentication
    ) {

        CustomUserDetails user =
                getCurrentUser(authentication);


        if (user == null
                || !Role.PATIENT.equals(user.getRole())
                || !StringUtils.hasText(medicalRecordId)) {

            return false;
        }


        return medicalRecordRepository
                .findById(
                        medicalRecordId.trim()
                )
                .map(record ->
                        user.getId()
                                .equals(
                                        record.getPatientId()
                                )
                                &&
                                !Boolean.TRUE.equals(
                                        record.getArchived()
                                )
                )
                .orElse(false);
    }


    public boolean canDoctorUpdateMedicalRecord(
            String medicalRecordId,
            String requestPatientId,
            Authentication authentication
    ) {

        CustomUserDetails user =
                getCurrentUser(authentication);


        if (user == null
                || !Role.DOCTOR.equals(user.getRole())
                || !StringUtils.hasText(medicalRecordId)
                || !StringUtils.hasText(requestPatientId)) {

            return false;
        }


        return medicalRecordRepository
                .findById(
                        medicalRecordId.trim()
                )
                .map(record ->
                        user.getId()
                                .equals(
                                        record.getDoctorId()
                                )
                                &&
                                requestPatientId
                                        .trim()
                                        .equals(
                                                record.getPatientId()
                                        )
                                &&
                                !Boolean.TRUE.equals(
                                        record.getArchived()
                                )
                )
                .orElse(false);
    }

    /*
 * DOCTOR:
 * can archive only a MedicalRecord
 * created by the logged-in doctor.
 */
public boolean canDoctorArchiveMedicalRecord(
        String medicalRecordId,
        Authentication authentication
) {

    CustomUserDetails user =
            getCurrentUser(authentication);


    if (user == null
            || user.getRole() != Role.DOCTOR
            || !StringUtils.hasText(medicalRecordId)) {

        return false;
    }


    return medicalRecordRepository
            .findById(
                    medicalRecordId.trim()
            )
            .map(record ->
                    user.getId()
                            .equals(
                                    record.getDoctorId()
                            )
                            &&
                            !Boolean.TRUE.equals(
                                    record.getArchived()
                            )
            )
            .orElse(false);
}

    /*
     * Used when Doctor creates:
     *
     * Diagnosis
     * Treatment
     * Medical Document
     */
    public boolean canDoctorUseMedicalRecord(
            String medicalRecordId,
            String patientId,
            Authentication authentication
    ) {

        CustomUserDetails user =
                getCurrentUser(authentication);


        if (user == null
                || !Role.DOCTOR.equals(user.getRole())
                || !StringUtils.hasText(medicalRecordId)
                || !StringUtils.hasText(patientId)) {

            return false;
        }


        return medicalRecordRepository
                .findById(
                        medicalRecordId.trim()
                )
                .map(record ->
                        user.getId()
                                .equals(
                                        record.getDoctorId()
                                )
                                &&
                                patientId
                                        .trim()
                                        .equals(
                                                record.getPatientId()
                                        )
                                &&
                                !Boolean.TRUE.equals(
                                        record.getArchived()
                                )
                )
                .orElse(false);
    }


    /*
     * =========================================================
     * DIAGNOSIS SECURITY
     * =========================================================
     */


    public boolean canPatientAccessDiagnosis(
            String diagnosisId,
            Authentication authentication
    ) {

        CustomUserDetails user =
                getCurrentUser(authentication);


        if (user == null
                || !Role.PATIENT.equals(user.getRole())
                || !StringUtils.hasText(diagnosisId)) {

            return false;
        }


        return diagnosisRepository
                .findById(
                        diagnosisId.trim()
                )
                .map(Diagnosis::getPatientId)
                .map(user.getId()::equals)
                .orElse(false);
    }


    public boolean canDoctorUpdateDiagnosis(
            String diagnosisId,
            String requestMedicalRecordId,
            String requestPatientId,
            Authentication authentication
    ) {

        CustomUserDetails user =
                getCurrentUser(authentication);


        if (user == null
                || !Role.DOCTOR.equals(user.getRole())
                || !StringUtils.hasText(diagnosisId)
                || !StringUtils.hasText(requestMedicalRecordId)
                || !StringUtils.hasText(requestPatientId)) {

            return false;
        }


        return diagnosisRepository
                .findById(
                        diagnosisId.trim()
                )
                .map(diagnosis ->
                        user.getId()
                                .equals(
                                        diagnosis.getDoctorId()
                                )
                                &&
                                requestMedicalRecordId
                                        .trim()
                                        .equals(
                                                diagnosis.getMedicalRecordId()
                                        )
                                &&
                                requestPatientId
                                        .trim()
                                        .equals(
                                                diagnosis.getPatientId()
                                        )
                )
                .orElse(false);
    }


    public boolean canDoctorDeleteDiagnosis(
            String diagnosisId,
            Authentication authentication
    ) {

        CustomUserDetails user =
                getCurrentUser(authentication);


        if (user == null
                || !Role.DOCTOR.equals(user.getRole())
                || !StringUtils.hasText(diagnosisId)) {

            return false;
        }


        return diagnosisRepository
                .findById(
                        diagnosisId.trim()
                )
                .map(Diagnosis::getDoctorId)
                .map(user.getId()::equals)
                .orElse(false);
    }


    /*
     * =========================================================
     * TREATMENT SECURITY
     * =========================================================
     */


    public boolean canPatientAccessTreatment(
            String treatmentId,
            Authentication authentication
    ) {

        CustomUserDetails user =
                getCurrentUser(authentication);


        if (user == null
                || !Role.PATIENT.equals(user.getRole())
                || !StringUtils.hasText(treatmentId)) {

            return false;
        }


        return treatmentRecordRepository
                .findById(
                        treatmentId.trim()
                )
                .map(TreatmentRecord::getPatientId)
                .map(user.getId()::equals)
                .orElse(false);
    }


    public boolean canDoctorUpdateTreatment(
            String treatmentId,
            String requestMedicalRecordId,
            String requestPatientId,
            Authentication authentication
    ) {

        CustomUserDetails user =
                getCurrentUser(authentication);


        if (user == null
                || !Role.DOCTOR.equals(user.getRole())
                || !StringUtils.hasText(treatmentId)
                || !StringUtils.hasText(requestMedicalRecordId)
                || !StringUtils.hasText(requestPatientId)) {

            return false;
        }


        return treatmentRecordRepository
                .findById(
                        treatmentId.trim()
                )
                .map(treatment ->
                        user.getId()
                                .equals(
                                        treatment.getDoctorId()
                                )
                                &&
                                requestMedicalRecordId
                                        .trim()
                                        .equals(
                                                treatment.getMedicalRecordId()
                                        )
                                &&
                                requestPatientId
                                        .trim()
                                        .equals(
                                                treatment.getPatientId()
                                        )
                )
                .orElse(false);
    }


    public boolean canDoctorDeleteTreatment(
            String treatmentId,
            Authentication authentication
    ) {

        CustomUserDetails user =
                getCurrentUser(authentication);


        if (user == null
                || !Role.DOCTOR.equals(user.getRole())
                || !StringUtils.hasText(treatmentId)) {

            return false;
        }


        return treatmentRecordRepository
                .findById(
                        treatmentId.trim()
                )
                .map(TreatmentRecord::getDoctorId)
                .map(user.getId()::equals)
                .orElse(false);
    }


    /*
     * =========================================================
     * MEDICAL DOCUMENT SECURITY
     * =========================================================
     */


    /*
     * PATIENT:
     * can access only own ACTIVE document.
     */
    public boolean canPatientAccessMedicalDocument(
            String documentId,
            Authentication authentication
    ) {

        CustomUserDetails user =
                getCurrentUser(authentication);


        if (user == null
                || !Role.PATIENT.equals(user.getRole())
                || !StringUtils.hasText(documentId)) {

            return false;
        }


        return medicalDocumentRepository
                .findById(
                        documentId.trim()
                )
                .map(document ->
                        user.getId()
                                .equals(
                                        document.getPatientId()
                                )
                                &&
                                isActiveMedicalDocument(
                                        document
                                )
                )
                .orElse(false);
    }


    /*
     * DOCTOR:
     * can view ACTIVE documents.
     *
     * Doctor does not need to be the
     * original uploader just to VIEW
     * patient clinical documents.
     */
    public boolean canDoctorViewMedicalDocument(
            String documentId,
            Authentication authentication
    ) {

        CustomUserDetails user =
                getCurrentUser(authentication);


        if (user == null
                || !Role.DOCTOR.equals(user.getRole())
                || !StringUtils.hasText(documentId)) {

            return false;
        }


        return medicalDocumentRepository
                .findById(
                        documentId.trim()
                )
                .map(this::isActiveMedicalDocument)
                .orElse(false);
    }


    /*
     * DOCTOR:
     * can modify a document only when
     * the parent MedicalRecord belongs
     * to the logged-in doctor.
     */
    public boolean canDoctorModifyMedicalDocument(
            String documentId,
            Authentication authentication
    ) {

        CustomUserDetails user =
                getCurrentUser(authentication);


        if (user == null
                || !Role.DOCTOR.equals(user.getRole())
                || !StringUtils.hasText(documentId)) {

            return false;
        }


        return medicalDocumentRepository
                .findById(
                        documentId.trim()
                )
                .filter(this::isActiveMedicalDocument)
                .map(document ->

                        medicalRecordRepository
                                .findById(
                                        document.getMedicalRecordId()
                                )
                                .map(record ->
                                        user.getId()
                                                .equals(
                                                        record.getDoctorId()
                                                )
                                                &&
                                                document
                                                        .getPatientId()
                                                        .equals(
                                                                record.getPatientId()
                                                        )
                                                &&
                                                !Boolean.TRUE.equals(
                                                        record.getArchived()
                                                )
                                )
                                .orElse(false)
                )
                .orElse(false);
    }


    /*
     * PATIENT:
     * can see version history only for
     * their own logical document while
     * that document group still has an
     * ACTIVE version.
     */
    public boolean canPatientAccessDocumentVersionHistory(
            String documentGroupIdOrDocumentId,
            Authentication authentication
    ) {

        CustomUserDetails user =
                getCurrentUser(authentication);


        if (user == null
                || !Role.PATIENT.equals(user.getRole())
                || !StringUtils.hasText(
                        documentGroupIdOrDocumentId
                )) {

            return false;
        }


        List<MedicalDocument> versions =
                resolveDocumentVersions(
                        documentGroupIdOrDocumentId
                );


        if (versions.isEmpty()) {

            return false;
        }


        boolean belongsToPatient =
                versions.stream()
                        .allMatch(document ->
                                user.getId()
                                        .equals(
                                                document.getPatientId()
                                        )
                        );


        boolean hasActiveVersion =
                versions.stream()
                        .anyMatch(
                                this::isActiveMedicalDocument
                        );


        return belongsToPatient
                && hasActiveVersion;
    }


    /*
     * DOCTOR:
     * version history can be viewed while
     * logical document has an ACTIVE version.
     */
    public boolean canDoctorAccessDocumentVersionHistory(
            String documentGroupIdOrDocumentId,
            Authentication authentication
    ) {

        CustomUserDetails user =
                getCurrentUser(authentication);


        if (user == null
                || !Role.DOCTOR.equals(user.getRole())
                || !StringUtils.hasText(
                        documentGroupIdOrDocumentId
                )) {

            return false;
        }


        List<MedicalDocument> versions =
                resolveDocumentVersions(
                        documentGroupIdOrDocumentId
                );


        return versions
                .stream()
                .anyMatch(
                        this::isActiveMedicalDocument
                );
    }


    /*
     * Resolve:
     *
     * documentGroupId
     * OR
     * documentId
     */
    private List<MedicalDocument> resolveDocumentVersions(
            String documentGroupIdOrDocumentId
    ) {

        String value =
                documentGroupIdOrDocumentId
                        .trim();


        List<MedicalDocument> versions =
                medicalDocumentRepository
                        .findByDocumentGroupIdOrderByVersionDesc(
                                value
                        );


        if (!versions.isEmpty()) {

            return versions;
        }


        return medicalDocumentRepository
                .findById(value)
                .map(document -> {

                    String groupId =
                            document.getDocumentGroupId();


                    if (!StringUtils.hasText(groupId)) {

                        return List.of(
                                document
                        );
                    }


                    List<MedicalDocument> groupVersions =
                            medicalDocumentRepository
                                    .findByDocumentGroupIdOrderByVersionDesc(
                                            groupId
                                    );


                    if (groupVersions.isEmpty()) {

                        return List.of(
                                document
                        );
                    }


                    return groupVersions;
                })
                .orElse(
                        List.of()
                );
    }


    /*
     * Legacy documents may have null status.
     * They are treated as ACTIVE.
     */
    private boolean isActiveMedicalDocument(
            MedicalDocument document
    ) {

        return document.getStatus() == null
                ||
                MedicalDocument.STATUS_ACTIVE
                        .equalsIgnoreCase(
                                document.getStatus()
                        );
    }


    /*
     * =========================================================
     * CURRENT AUTHENTICATED USER
     * =========================================================
     */


    private CustomUserDetails getCurrentUser(
            Authentication authentication
    ) {

        if (authentication == null
                || !(authentication.getPrincipal()
                instanceof CustomUserDetails)) {

            return null;
        }


        return (CustomUserDetails)
                authentication.getPrincipal();
    }
}