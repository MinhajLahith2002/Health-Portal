package lk.gamage.backend.healthbridgebackend.dto.request;

import lombok.Data;

@Data
public class AddContactRequest {
    private String name;
    private String relationship;
    private String phone;
    private String email;
    private boolean isPrimary;
}
