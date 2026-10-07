package lk.gamage.backend.healthbridgebackend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;
    private final String cloudName;
    private final String apiKey;
    private final String apiSecret;

    public CloudinaryService(
            Cloudinary cloudinary,
            @Value("${cloudinary.cloud-name:}") String cloudName,
            @Value("${cloudinary.api-key:}") String apiKey,
            @Value("${cloudinary.api-secret:}") String apiSecret
    ) {
        this.cloudinary = cloudinary;
        this.cloudName = cloudName;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }

    public Map<String, Object> uploadFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        requireConfiguration();

        try {
            return cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap("resource_type", "auto")
            );
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file to Cloudinary", e);
        }
    }

    public Map<String, String> uploadFile(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        requireConfiguration();

        try {
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "auto"
                    )
            );

            String url = (String) uploadResult.get("secure_url");
            String publicId = (String) uploadResult.get("public_id");
            return Map.of("url", url, "publicId", publicId);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file to Cloudinary: " + e.getMessage(), e);
        }
    }

    public void deleteFile(String publicId, String resourceType) {
        if (publicId == null || publicId.isBlank()) {
            return;
        }

        requireConfiguration();

        try {
            cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.asMap(
                            "resource_type",
                            resourceType == null || resourceType.isBlank() ? "auto" : resourceType
                    )
            );
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file from Cloudinary", e);
        }
    }

    private void requireConfiguration() {
        if (cloudName.isBlank() || apiKey.isBlank() || apiSecret.isBlank()) {
            throw new IllegalStateException(
                    "Cloudinary is not configured. Set cloudinary.cloud-name, cloudinary.api-key, and cloudinary.api-secret before uploading or deleting files."
            );
        }
    }
    public void deleteFile(String publicId) {
    try {

        cloudinary.uploader().destroy(
                publicId,
                ObjectUtils.asMap(
                        "resource_type", "raw"
                )
        );

    } catch (Exception e) {

        throw new RuntimeException(
                "Failed to delete file from Cloudinary: "
                        + e.getMessage()
        );
    }
}
}