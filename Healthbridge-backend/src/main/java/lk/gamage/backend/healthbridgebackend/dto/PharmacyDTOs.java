package lk.gamage.backend.healthbridgebackend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class PharmacyDTOs {

    @Data
    public static class Request {
        @NotBlank
        private String registrationNumber;

        @NotBlank
        private String name;

        @NotBlank
        private String licenseNumber;

        private String contactPerson;
        private String phoneNumber;

        @Email
        private String email;

        private String address;
        private String city;
        private String operatingHours;
    }

    @Data
    public static class Response {
        private String id;
        private String registrationNumber;
        private String name;
        private String licenseNumber;
        private String contactPerson;
        private String phoneNumber;
        private String email;
        private String address;
        private String city;
        private boolean active;
        private boolean approved;
    }
}