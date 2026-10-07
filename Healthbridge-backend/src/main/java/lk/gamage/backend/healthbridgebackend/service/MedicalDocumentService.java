package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.request.MedicalDocumentUpdateRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.MedicalDocumentResponse;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;


public interface MedicalDocumentService {

    MedicalDocumentResponse uploadDocument(
            MultipartFile file,
            String medicalRecordId,
            String patientId,
            String doctorId,
            String documentType,
            String description
    );


    List<MedicalDocumentResponse> getAllDocuments();


    MedicalDocumentResponse getDocumentById(
            String id
    );


    List<MedicalDocumentResponse>
    getDocumentsByMedicalRecord(
            String medicalRecordId
    );


    List<MedicalDocumentResponse>
    getDocumentsByPatient(
            String patientId
    );


    List<MedicalDocumentResponse>
    getDocumentsByDoctor(
            String doctorId
    );


    MedicalDocumentResponse updateDocumentMetadata(
            String id,
            MedicalDocumentUpdateRequest request
    );


    MedicalDocumentResponse replaceDocumentFile(
            String id,
            MultipartFile file,
            String doctorId,
            String description
    );


    MedicalDocumentResponse archiveDocument(
            String id
    );


    List<MedicalDocumentResponse>
    getArchivedDocuments();


    List<MedicalDocumentResponse>
    getDocumentVersionHistory(
            String documentGroupIdOrDocumentId
    );


    void permanentlyDeleteDocument(
            String id
    );
}