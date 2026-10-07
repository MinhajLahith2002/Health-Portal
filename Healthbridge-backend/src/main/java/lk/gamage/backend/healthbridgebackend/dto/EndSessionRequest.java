package lk.gamage.backend.healthbridgebackend.dto;

import lombok.Data;

@Data
public class EndSessionRequest {
    private String doctorNotes;
    private boolean requestAiSummary;
    private boolean screenSharingUsed;
}
