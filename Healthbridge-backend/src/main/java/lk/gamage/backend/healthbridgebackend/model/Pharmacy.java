package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "pharmacies")
public class Pharmacy {

    @Id
    private String id;

    @Indexed(unique = true)
    private String registrationNumber;

    private String name;
    private String licenseNumber;
    private String contactPerson;
    private String phoneNumber;
    private String email;
    private String address;
    private String city;
    private String ownerUserId;
    private String operatingHours;

    private boolean active;
    private boolean approved;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}