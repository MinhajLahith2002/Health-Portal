package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.model.SupportDocument;
import lk.gamage.backend.healthbridgebackend.repository.SupportDocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class SupportDocumentService {

    @Autowired
    private SupportDocumentRepository repository;

    @Autowired
    private CloudinaryService cloudinaryService;


    public SupportDocument uploadDocument(
            String category,
            String description,
            MultipartFile file
    ) {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is required");
        }

        // Cloudinary folder based only on category
        String folder =
                "healthbridge/support/" + category;

        // Existing Cloudinary service
        Map<String, String> uploadResult =
                cloudinaryService.uploadFile(
                        file,
                        folder
                );

        SupportDocument document =
                new SupportDocument();

        document.setCategory(category);

        document.setDescription(description);

        document.setFileName(
                file.getOriginalFilename()
        );

        document.setFileType(
                file.getContentType()
        );

        document.setFileUrl(
                uploadResult.get("url")
        );

        document.setPublicId(
                uploadResult.get("publicId")
        );

        document.setCreatedAt(
                LocalDateTime.now()
        );

        document.setUpdatedAt(
                LocalDateTime.now()
        );

        return repository.save(document);
    }


    public List<SupportDocument> getAllDocuments() {

        return repository.findAll();
    }


    public List<SupportDocument> getByCategory(
            String category
    ) {

        return repository.findByCategory(category);
    }

public void deleteDocument(String id) {

    SupportDocument document = repository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException("Support document not found")
            );

    // Delete from Cloudinary
    if (document.getPublicId() != null &&
            !document.getPublicId().isBlank()) {

       cloudinaryService.deleteFile(
        document.getPublicId()
);
    }

    // Delete from MongoDB
    repository.deleteById(id);
}





}