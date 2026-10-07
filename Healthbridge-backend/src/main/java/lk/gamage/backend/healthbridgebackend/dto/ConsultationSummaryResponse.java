package lk.gamage.backend.healthbridgebackend.dto;

import lk.gamage.backend.healthbridgebackend.model.ConsultationSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationSummaryResponse {
    private String id;
    private String telemedicineSessionId;
    private String doctorNotes;
    private String aiGeneratedSummary;
    private ConsultationSession.AiSummaryStatus aiSummaryStatus;
    private List<String> keySymptomsDiscussed;
    private List<String> followUpActions;
    private boolean followUpRequired;
    private LocalDateTime followUpDate;
    private String recordingUrl;
}
