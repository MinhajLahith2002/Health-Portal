package lk.gamage.backend.healthbridgebackend.dto;

import lombok.Data;

import java.util.List;

@Data
public class LabResultResponseDto {

    private String resultId;
    private String testOrderId;
    private String patientId;
    private List<ParameterDto> parameters;
    private boolean critical;
    private String status;

    @Data
    public static class ParameterDto {
        private String parameterName;
        private String value;
        private String unit;
        private String referenceRange;
        private boolean outOfRange;
    }
}
