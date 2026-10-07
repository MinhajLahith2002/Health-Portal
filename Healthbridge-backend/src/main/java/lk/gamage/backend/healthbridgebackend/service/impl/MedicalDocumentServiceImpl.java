package lk.gamage.backend.healthbridgebackend.service.impl;

import lk.gamage.backend.healthbridgebackend.dto.request.MedicalDocumentUpdateRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.MedicalDocumentResponse;
import lk.gamage.backend.healthbridgebackend.exception.BadRequestException;
import lk.gamage.backend.healthbridgebackend.exception.ResourceNotFoundException;
import lk.gamage.backend.healthbridgebackend.model.MedicalDocument;
import lk.gamage.backend.healthbridgebackend.model.MedicalRecord;
import lk.gamage.backend.healthbridgebackend.repository.MedicalDocumentRepository;
import lk.gamage.backend.healthbridgebackend.repository.MedicalRecordRepository;
import lk.gamage.backend.healthbridgebackend.service.MedicalDocumentCloudinaryService;
import lk.gamage.backend.healthbridgebackend.service.MedicalDocumentService;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;


@Service
public class MedicalDocumentServiceImpl
        implements MedicalDocumentService {


    private static final long MAX_FILE_SIZE =
            10L * 1024L * 1024L;


    private static final Set<String>
            ALLOWED_CONTENT_TYPES =
            Set.of(
                    "application/pdf",
                    "image/jpeg",
                    "image/png"
            );


    private final MedicalDocumentRepository
            medicalDocumentRepository;

    private final MedicalRecordRepository
            medicalRecordRepository;

    private final MedicalDocumentCloudinaryService
            medicalDocumentCloudinaryService;


    public MedicalDocumentServiceImpl(
            MedicalDocumentRepository medicalDocumentRepository,
            MedicalRecordRepository medicalRecordRepository,
            MedicalDocumentCloudinaryService medicalDocumentCloudinaryService
    ) {

        this.medicalDocumentRepository =
                medicalDocumentRepository;

        this.medicalRecordRepository =
                medicalRecordRepository;

        this.medicalDocumentCloudinaryService =
                medicalDocumentCloudinaryService;
    }


    @Override
    public MedicalDocumentResponse uploadDocument(
            MultipartFile file,
            String medicalRecordId,
            String patientId,
            String doctorId,
            String documentType,
            String description
    ) {

        validateUploadRequest(
                file,
                medicalRecordId,
                patientId,
                doctorId,
                documentType
        );


        MedicalRecord medicalRecord =
                findActiveMedicalRecord(
                        medicalRecordId
                );


        validatePatientMatchesMedicalRecord(
                medicalRecord,
                patientId
        );


        Map<String, String> uploadedFile =
                medicalDocumentCloudinaryService
                        .uploadMedicalDocument(
                                file
                        );


        LocalDateTime now =
                LocalDateTime.now();


        MedicalDocument medicalDocument =
                new MedicalDocument();


        medicalDocument.setMedicalRecordId(
                medicalRecordId
        );


        medicalDocument.setPatientId(
                patientId
        );


        medicalDocument.setDoctorId(
                doctorId.trim()
        );


        medicalDocument.setDocumentGroupId(
                UUID.randomUUID().toString()
        );


        medicalDocument.setVersion(
                1
        );


        medicalDocument.setStatus(
                MedicalDocument.STATUS_ACTIVE
        );


        medicalDocument.setDocumentType(
                documentType
                        .trim()
                        .toUpperCase(Locale.ROOT)
        );


        medicalDocument.setFileName(
                getSafeFileName(
                        file.getOriginalFilename()
                )
        );


        medicalDocument.setContentType(
                file.getContentType()
        );


        medicalDocument.setFileSize(
                file.getSize()
        );


        medicalDocument.setFileUrl(
                uploadedFile.get("url")
        );


        medicalDocument.setCloudinaryPublicId(
                uploadedFile.get("publicId")
        );


        medicalDocument.setCloudinaryResourceType(
                uploadedFile.get("resourceType")
        );


        medicalDocument.setDescription(
                normalizeOptionalText(
                        description
                )
        );


        medicalDocument.setUploadedAt(
                now
        );


        medicalDocument.setUpdatedAt(
                now
        );


        medicalDocument.setArchivedAt(
                null
        );


        try {

            MedicalDocument savedDocument =
                    medicalDocumentRepository.save(
                            medicalDocument
                    );


            return mapToResponse(
                    savedDocument
            );


        } catch (RuntimeException exception) {

            cleanupCloudinaryFile(
                    uploadedFile
            );


            throw exception;
        }
    }


    @Override
    public List<MedicalDocumentResponse>
    getAllDocuments() {

        return medicalDocumentRepository
                .findAllByOrderByUploadedAtDesc()
                .stream()
                .filter(this::isActive)
                .map(this::mapToResponse)
                .toList();
    }


    @Override
    public MedicalDocumentResponse
    getDocumentById(
            String id
    ) {

        return mapToResponse(
                findDocumentById(id)
        );
    }


    @Override
    public List<MedicalDocumentResponse>
    getDocumentsByMedicalRecord(
            String medicalRecordId
    ) {

        if (!StringUtils.hasText(
                medicalRecordId
        )) {

            throw new BadRequestException(
                    "Medical record ID is required"
            );
        }


        return medicalDocumentRepository
                .findByMedicalRecordIdOrderByUploadedAtDesc(
                        medicalRecordId
                )
                .stream()
                .filter(this::isActive)
                .map(this::mapToResponse)
                .toList();
    }


    @Override
    public List<MedicalDocumentResponse>
    getDocumentsByPatient(
            String patientId
    ) {

        if (!StringUtils.hasText(
                patientId
        )) {

            throw new BadRequestException(
                    "Patient ID is required"
            );
        }


        return medicalDocumentRepository
                .findByPatientIdOrderByUploadedAtDesc(
                        patientId
                )
                .stream()
                .filter(this::isActive)
                .map(this::mapToResponse)
                .toList();
    }


    @Override
    public List<MedicalDocumentResponse>
    getDocumentsByDoctor(
            String doctorId
    ) {

        if (!StringUtils.hasText(
                doctorId
        )) {

            throw new BadRequestException(
                    "Doctor ID is required"
            );
        }


        return medicalDocumentRepository
                .findByDoctorIdOrderByUploadedAtDesc(
                        doctorId
                )
                .stream()
                .filter(this::isActive)
                .map(this::mapToResponse)
                .toList();
    }


    @Override
    public MedicalDocumentResponse
    updateDocumentMetadata(
            String id,
            MedicalDocumentUpdateRequest request
    ) {

        if (request == null) {

            throw new BadRequestException(
                    "Update request is required"
            );
        }


        MedicalDocument document =
                findDocumentById(id);


        requireActiveDocument(
                document
        );


        boolean updateDocumentType =
                StringUtils.hasText(
                        request.getDocumentType()
                );


        boolean updateDescription =
                request.getDescription() != null;


        if (!updateDocumentType
                && !updateDescription) {

            throw new BadRequestException(
                    "Provide documentType or description to update"
            );
        }


        ensureLifecycleFields(
                document
        );


        if (updateDocumentType) {

            document.setDocumentType(
                    request
                            .getDocumentType()
                            .trim()
                            .toUpperCase(
                                    Locale.ROOT
                            )
            );
        }


        if (updateDescription) {

            document.setDescription(
                    normalizeOptionalText(
                            request.getDescription()
                    )
            );
        }


        document.setUpdatedAt(
                LocalDateTime.now()
        );


        MedicalDocument updatedDocument =
                medicalDocumentRepository.save(
                        document
                );


        return mapToResponse(
                updatedDocument
        );
    }


    @Override
    public MedicalDocumentResponse
    replaceDocumentFile(
            String id,
            MultipartFile file,
            String doctorId,
            String description
    ) {

        validateFile(
                file
        );


        if (!StringUtils.hasText(
                doctorId
        )) {

            throw new BadRequestException(
                    "Doctor ID is required"
            );
        }


        MedicalDocument currentDocument =
                findDocumentById(id);


        requireActiveDocument(
                currentDocument
        );


        MedicalRecord medicalRecord =
                findActiveMedicalRecord(
                        currentDocument
                                .getMedicalRecordId()
                );


        validatePatientMatchesMedicalRecord(
                medicalRecord,
                currentDocument.getPatientId()
        );


        ensureLifecycleFields(
                currentDocument
        );


        String documentGroupId =
                resolveDocumentGroupId(
                        currentDocument
                );


        int currentVersion =
                resolveVersion(
                        currentDocument
                );


        String previousStatus =
                currentDocument.getStatus();

        LocalDateTime previousUpdatedAt =
                currentDocument.getUpdatedAt();

        LocalDateTime previousArchivedAt =
                currentDocument.getArchivedAt();


        Map<String, String> uploadedFile =
                medicalDocumentCloudinaryService
                        .uploadMedicalDocument(
                                file
                        );


        LocalDateTime now =
                LocalDateTime.now();


        currentDocument.setDocumentGroupId(
                documentGroupId
        );


        currentDocument.setVersion(
                currentVersion
        );


        currentDocument.setStatus(
                MedicalDocument.STATUS_SUPERSEDED
        );


        currentDocument.setUpdatedAt(
                now
        );


        currentDocument.setArchivedAt(
                null
        );


        try {

            medicalDocumentRepository.save(
                    currentDocument
            );

        } catch (RuntimeException exception) {

            cleanupCloudinaryFile(
                    uploadedFile
            );


            throw exception;
        }


        MedicalDocument newVersion =
                new MedicalDocument();


        newVersion.setMedicalRecordId(
                currentDocument.getMedicalRecordId()
        );


        newVersion.setPatientId(
                currentDocument.getPatientId()
        );


        newVersion.setDoctorId(
                doctorId.trim()
        );


        newVersion.setDocumentGroupId(
                documentGroupId
        );


        newVersion.setVersion(
                currentVersion + 1
        );


        newVersion.setStatus(
                MedicalDocument.STATUS_ACTIVE
        );


        newVersion.setDocumentType(
                currentDocument.getDocumentType()
        );


        newVersion.setFileName(
                getSafeFileName(
                        file.getOriginalFilename()
                )
        );


        newVersion.setContentType(
                file.getContentType()
        );


        newVersion.setFileSize(
                file.getSize()
        );


        newVersion.setFileUrl(
                uploadedFile.get("url")
        );


        newVersion.setCloudinaryPublicId(
                uploadedFile.get("publicId")
        );


        newVersion.setCloudinaryResourceType(
                uploadedFile.get(
                        "resourceType"
                )
        );


        if (StringUtils.hasText(
                description
        )) {

            newVersion.setDescription(
                    description.trim()
            );

        } else {

            newVersion.setDescription(
                    currentDocument.getDescription()
            );
        }


        newVersion.setUploadedAt(
                now
        );


        newVersion.setUpdatedAt(
                now
        );


        newVersion.setArchivedAt(
                null
        );


        try {

            MedicalDocument savedNewVersion =
                    medicalDocumentRepository.save(
                            newVersion
                    );


            return mapToResponse(
                    savedNewVersion
            );


        } catch (RuntimeException exception) {

            try {

                currentDocument.setStatus(
                        previousStatus
                );


                currentDocument.setUpdatedAt(
                        previousUpdatedAt
                );


                currentDocument.setArchivedAt(
                        previousArchivedAt
                );


                medicalDocumentRepository.save(
                        currentDocument
                );

            } catch (RuntimeException ignored) {
            }


            cleanupCloudinaryFile(
                    uploadedFile
            );


            throw exception;
        }
    }


    @Override
    public MedicalDocumentResponse
    archiveDocument(
            String id
    ) {

        MedicalDocument document =
                findDocumentById(id);


        requireActiveDocument(
                document
        );


        ensureLifecycleFields(
                document
        );


        LocalDateTime now =
                LocalDateTime.now();


        document.setStatus(
                MedicalDocument.STATUS_ARCHIVED
        );


        document.setArchivedAt(
                now
        );


        document.setUpdatedAt(
                now
        );


        MedicalDocument archivedDocument =
                medicalDocumentRepository.save(
                        document
                );


        return mapToResponse(
                archivedDocument
        );
    }


    @Override
    public List<MedicalDocumentResponse>
    getArchivedDocuments() {

        return medicalDocumentRepository
                .findByStatusOrderByUploadedAtDesc(
                        MedicalDocument.STATUS_ARCHIVED
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    @Override
    public List<MedicalDocumentResponse>
    getDocumentVersionHistory(
            String documentGroupIdOrDocumentId
    ) {

        if (!StringUtils.hasText(
                documentGroupIdOrDocumentId
        )) {

            throw new BadRequestException(
                    "Document group ID or document ID is required"
            );
        }


        String value =
                documentGroupIdOrDocumentId.trim();


        List<MedicalDocument> versions =
                medicalDocumentRepository
                        .findByDocumentGroupIdOrderByVersionDesc(
                                value
                        );


        if (versions.isEmpty()) {

            Optional<MedicalDocument> optionalDocument =
                    medicalDocumentRepository
                            .findById(value);


            if (optionalDocument.isEmpty()) {

                throw new ResourceNotFoundException(
                        "Medical document version history not found"
                );
            }


            MedicalDocument document =
                    optionalDocument.get();


            String resolvedGroupId =
                    resolveDocumentGroupId(
                            document
                    );


            versions =
                    medicalDocumentRepository
                            .findByDocumentGroupIdOrderByVersionDesc(
                                    resolvedGroupId
                            );


            if (versions.isEmpty()) {

                return List.of(
                        mapToResponse(
                                document
                        )
                );
            }
        }


        return versions
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    /*
     * ---------------------------------------------------------
     * PERMANENT DELETE
     * ---------------------------------------------------------
     *
     * Safety rule:
     * Only ARCHIVED documents can be permanently deleted.
     *
     * Flow:
     * 1. Find document
     * 2. Verify ARCHIVED
     * 3. Delete Cloudinary asset
     * 4. Delete MongoDB metadata
     *
     * This operation cannot be undone.
     */
    @Override
    public void permanentlyDeleteDocument(
            String id
    ) {

        MedicalDocument document =
                findDocumentById(id);


        String status =
                resolveStatus(
                        document
                );


        if (!MedicalDocument.STATUS_ARCHIVED
                .equalsIgnoreCase(status)) {

            throw new BadRequestException(
                    "Only archived medical documents can be permanently deleted"
            );
        }


        medicalDocumentCloudinaryService
                .deleteMedicalDocument(
                        document
                                .getCloudinaryPublicId(),

                        document
                                .getCloudinaryResourceType()
                );


        medicalDocumentRepository.delete(
                document
        );
    }


    /*
     * ---------------------------------------------------------
     * HELPERS
     * ---------------------------------------------------------
     */

    private MedicalDocument findDocumentById(
            String id
    ) {

        if (!StringUtils.hasText(id)) {

            throw new BadRequestException(
                    "Medical document ID is required"
            );
        }


        return medicalDocumentRepository
                .findById(id)
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "Medical document not found"
                                )
                );
    }


    private MedicalRecord findActiveMedicalRecord(
            String medicalRecordId
    ) {

        if (!StringUtils.hasText(
                medicalRecordId
        )) {

            throw new BadRequestException(
                    "Medical record ID is required"
            );
        }


        MedicalRecord medicalRecord =
                medicalRecordRepository
                        .findById(
                                medicalRecordId
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
                    "Cannot modify documents for an archived medical record"
            );
        }


        return medicalRecord;
    }


    private void validatePatientMatchesMedicalRecord(
            MedicalRecord medicalRecord,
            String patientId
    ) {

        if (!Objects.equals(
                medicalRecord.getPatientId(),
                patientId
        )) {

            throw new BadRequestException(
                    "Patient ID does not match the medical record"
            );
        }
    }


    private void requireActiveDocument(
            MedicalDocument document
    ) {

        if (!isActive(document)) {

            throw new BadRequestException(
                    "Only an active medical document can be modified"
            );
        }
    }


    private boolean isActive(
            MedicalDocument document
    ) {

        return MedicalDocument.STATUS_ACTIVE
                .equalsIgnoreCase(
                        resolveStatus(
                                document
                        )
                );
    }


    private String resolveStatus(
            MedicalDocument document
    ) {

        if (!StringUtils.hasText(
                document.getStatus()
        )) {

            return MedicalDocument.STATUS_ACTIVE;
        }


        return document
                .getStatus()
                .trim()
                .toUpperCase(
                        Locale.ROOT
                );
    }


    private int resolveVersion(
            MedicalDocument document
    ) {

        if (document.getVersion() == null
                || document.getVersion() < 1) {

            return 1;
        }


        return document.getVersion();
    }


    private String resolveDocumentGroupId(
            MedicalDocument document
    ) {

        if (StringUtils.hasText(
                document.getDocumentGroupId()
        )) {

            return document
                    .getDocumentGroupId()
                    .trim();
        }


        return document.getId();
    }


    private void ensureLifecycleFields(
            MedicalDocument document
    ) {

        if (!StringUtils.hasText(
                document.getDocumentGroupId()
        )) {

            document.setDocumentGroupId(
                    document.getId()
            );
        }


        if (document.getVersion() == null
                || document.getVersion() < 1) {

            document.setVersion(
                    1
            );
        }


        if (!StringUtils.hasText(
                document.getStatus()
        )) {

            document.setStatus(
                    MedicalDocument.STATUS_ACTIVE
            );
        }


        if (document.getUpdatedAt() == null) {

            document.setUpdatedAt(
                    document.getUploadedAt()
            );
        }
    }


    private void validateUploadRequest(
            MultipartFile file,
            String medicalRecordId,
            String patientId,
            String doctorId,
            String documentType
    ) {

        validateFile(
                file
        );


        if (!StringUtils.hasText(
                medicalRecordId
        )) {

            throw new BadRequestException(
                    "Medical record ID is required"
            );
        }


        if (!StringUtils.hasText(
                patientId
        )) {

            throw new BadRequestException(
                    "Patient ID is required"
            );
        }


        if (!StringUtils.hasText(
                doctorId
        )) {

            throw new BadRequestException(
                    "Doctor ID is required"
            );
        }


        if (!StringUtils.hasText(
                documentType
        )) {

            throw new BadRequestException(
                    "Document type is required"
            );
        }
    }


    private void validateFile(
            MultipartFile file
    ) {

        if (file == null
                || file.isEmpty()) {

            throw new BadRequestException(
                    "Medical document file is required"
            );
        }


        if (file.getSize() > MAX_FILE_SIZE) {

            throw new BadRequestException(
                    "Medical document cannot exceed 10 MB"
            );
        }


        String contentType =
                file.getContentType();


        if (contentType == null
                || !ALLOWED_CONTENT_TYPES
                .contains(
                        contentType
                                .toLowerCase(
                                        Locale.ROOT
                                )
                )) {

            throw new BadRequestException(
                    "Only PDF, JPEG and PNG files are allowed"
            );
        }
    }


    private String getSafeFileName(
            String originalFileName
    ) {

        if (!StringUtils.hasText(
                originalFileName
        )) {

            return "medical-document";
        }


        try {

            return Paths
                    .get(originalFileName)
                    .getFileName()
                    .toString();

        } catch (Exception exception) {

            return "medical-document";
        }
    }


    private String normalizeOptionalText(
            String value
    ) {

        if (!StringUtils.hasText(
                value
        )) {

            return null;
        }


        return value.trim();
    }


    private void cleanupCloudinaryFile(
            Map<String, String> uploadedFile
    ) {

        if (uploadedFile == null) {
            return;
        }


        try {

            medicalDocumentCloudinaryService
                    .deleteMedicalDocument(
                            uploadedFile.get(
                                    "publicId"
                            ),
                            uploadedFile.get(
                                    "resourceType"
                            )
                    );

        } catch (RuntimeException ignored) {
        }
    }


    private MedicalDocumentResponse
    mapToResponse(
            MedicalDocument document
    ) {

        MedicalDocumentResponse response =
                new MedicalDocumentResponse();


        response.setId(
                document.getId()
        );


        response.setMedicalRecordId(
                document.getMedicalRecordId()
        );


        response.setPatientId(
                document.getPatientId()
        );


        response.setDoctorId(
                document.getDoctorId()
        );


        response.setDocumentGroupId(
                resolveDocumentGroupId(
                        document
                )
        );


        response.setVersion(
                resolveVersion(
                        document
                )
        );


        response.setStatus(
                resolveStatus(
                        document
                )
        );


        response.setDocumentType(
                document.getDocumentType()
        );


        response.setFileName(
                document.getFileName()
        );


        response.setContentType(
                document.getContentType()
        );


        response.setFileSize(
                document.getFileSize()
        );


        response.setFileUrl(
                document.getFileUrl()
        );


        response.setDescription(
                document.getDescription()
        );


        response.setUploadedAt(
                document.getUploadedAt()
        );


        response.setUpdatedAt(
                document.getUpdatedAt() == null
                        ? document.getUploadedAt()
                        : document.getUpdatedAt()
        );


        response.setArchivedAt(
                document.getArchivedAt()
        );


        return response;
    }
}