package lk.gamage.backend.healthbridgebackend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class MedicineDto {

    @Data
    public static class Request {
        @NotBlank
        private String medicineCode;

        @NotBlank
        private String name;

        private String genericName;
        private String brand;
        private String manufacturer;
        private String category;
        private String dosageForm;
        private String strength;
        private boolean controlledDrug;
        private boolean prescriptionRequired;
        private double unitPrice;
    }

    @Data
    public static class Response {
        private String id;
        private String medicineCode;
        private String name;
        private String genericName;
        private String brand;
        private String category;
        private String dosageForm;
        private String strength;
        private boolean prescriptionRequired;
        private double unitPrice;
    }
}