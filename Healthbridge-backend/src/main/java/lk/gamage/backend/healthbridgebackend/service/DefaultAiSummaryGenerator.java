package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.model.ConsultationSession;
import lk.gamage.backend.healthbridgebackend.repository.ConsultationSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Default implementation. Replace the body of {@link #callSummarizationProvider}
 * with a real call to your summarization service/LLM. Wiring it here keeps
 * that integration isolated from the rest of the telemedicine module.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DefaultAiSummaryGenerator implements AiSummaryGenerator {

    private final ConsultationSessionRepository consultationSessionRepository;

    @Override
    @Async
    public void generateSummaryAsync(String consultationSessionId, String transcriptOrNotes) {
        consultationSessionRepository.findById(consultationSessionId).ifPresent(session -> {
            try {
                session.setAiSummaryStatus(ConsultationSession.AiSummaryStatus.PENDING);
                consultationSessionRepository.save(session);

                String summary = callSummarizationProvider(transcriptOrNotes);

                session.setAiGeneratedSummary(summary);
                session.setAiSummaryStatus(ConsultationSession.AiSummaryStatus.COMPLETED);
                consultationSessionRepository.save(session);
            } catch (Exception ex) {
                log.error("AI summary generation failed for consultationSessionId={}", consultationSessionId, ex);
                session.setAiSummaryStatus(ConsultationSession.AiSummaryStatus.FAILED);
                consultationSessionRepository.save(session);
            }
        });
    }

    /**
     * Placeholder for the actual summarization call. Wire this to your
     * chosen provider (in-house model, hosted LLM API, etc).
     */
    private String callSummarizationProvider(String transcriptOrNotes) {
        if (transcriptOrNotes == null || transcriptOrNotes.isBlank()) {
            return "No notes were provided for this consultation.";
        }
        // TODO: replace with real summarization call.
        return "Summary pending integration with summarization provider. Raw notes: " + transcriptOrNotes;
    }
}
