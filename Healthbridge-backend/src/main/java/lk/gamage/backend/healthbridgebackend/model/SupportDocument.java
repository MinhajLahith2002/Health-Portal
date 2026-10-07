package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "support_documents")
public class SupportDocument {

    @Id
    private String id;

    private String category;

    private String description;

    private String fileName;

    private String fileType;

    private String fileUrl;

    private String publicId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}