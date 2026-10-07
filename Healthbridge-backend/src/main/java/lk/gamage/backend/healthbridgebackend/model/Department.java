package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "departments")
public class Department {

    @Id
    private String id;

    private String departmentId;

    private String name;

    private String head;

    private Integer doctorsCount;

    private Integer staffCount;

    private String location;

    private String status;

    private String description;

    private String contactEmail;

    private String contactPhone;

    private String branchId;
    private String branchCode;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
