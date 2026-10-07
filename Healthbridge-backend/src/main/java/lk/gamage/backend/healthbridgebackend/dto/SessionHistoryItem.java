package lk.gamage.backend.healthbridgebackend.dto;

import lk.gamage.backend.healthbridgebackend.model.ConsultationType;
import lk.gamage.backend.healthbridgebackend.model.SessionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionHistoryItem {
    private String id;
    private String counterpartName;
    private String counterpartId;
    private ConsultationType consultationType;
    private SessionStatus status;
    private LocalDateTime scheduledStartTime;
    private Long durationInSeconds;
    private boolean hasRecording;
    private boolean hasSummary;
}
