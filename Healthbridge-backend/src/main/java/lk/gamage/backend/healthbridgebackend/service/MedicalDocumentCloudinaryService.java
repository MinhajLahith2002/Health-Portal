package lk.gamage.backend.healthbridgebackend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;


@Service
public class MedicalDocumentCloudinaryService {

    private static final String MEDICAL_DOCUMENT_FOLDER =
            "healthbridge/medical-documents";


    private final Cloudinary cloudinary;


    public MedicalDocumentCloudinaryService(
            Cloudinary cloudinary
    ) {
        this.cloudinary = cloudinary;
    }


    public Map<String, String> uploadMedicalDocument(
            MultipartFile file
    ) {

        try {

            Map<?, ?> uploadResult =
                    cloudinary.uploader().upload(
                            file.getBytes(),
                            ObjectUtils.asMap(
                                    "folder",
                                    MEDICAL_DOCUMENT_FOLDER,

                                    "resource_type",
                                    "auto",

                                    "use_filename",
                                    true,

                                    "unique_filename",
                                    true
                            )
                    );


            String secureUrl =
                    uploadResult.get("secure_url") == null
                            ? null
                            : uploadResult
                            .get("secure_url")
                            .toString();


            String publicId =
                    uploadResult.get("public_id") == null
                            ? null
                            : uploadResult
                            .get("public_id")
                            .toString();


            String resourceType =
                    uploadResult.get("resource_type") == null
                            ? "image"
                            : uploadResult
                            .get("resource_type")
                            .toString();


            if (secureUrl == null
                    || publicId == null) {

                throw new RuntimeException(
                        "Cloudinary upload did not return the required file information"
                );
            }


            Map<String, String> response =
                    new HashMap<>();


            response.put(
                    "url",
                    secureUrl
            );


            response.put(
                    "publicId",
                    publicId
            );


            response.put(
                    "resourceType",
                    resourceType
            );


            return response;


        } catch (IOException exception) {

            throw new RuntimeException(
                    "Failed to upload medical document to Cloudinary",
                    exception
            );
        }
    }


    public void deleteMedicalDocument(
            String publicId,
            String resourceType
    ) {

        if (publicId == null
                || publicId.isBlank()) {

            return;
        }


        String resolvedResourceType =
                resourceType == null
                        || resourceType.isBlank()
                        ? "image"
                        : resourceType;


        try {

            cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.asMap(
                            "resource_type",
                            resolvedResourceType,

                            "invalidate",
                            true
                    )
            );


        } catch (IOException exception) {

            throw new RuntimeException(
                    "Failed to delete medical document from Cloudinary",
                    exception
            );
        }
    }
}