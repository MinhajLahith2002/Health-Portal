package lk.gamage.backend.healthbridgebackend.service;

/**
 * Abstraction over whatever service produces the AI-generated consultation
 * summary (e.g. a transcript sent to an LLM). Kept separate from
 * TelemedicineService so the summarization provider can be swapped without
 * touching session lifecycle logic.
 */
public interface AiSummaryGenerator {

    /**
     * Kicks off summary generation for a completed session. Implementations
     * should run this asynchronously and update the ConsultationSession
     * record when done (status PENDING -> COMPLETED/FAILED).
     *
     * @param consultationSessionId id of the ConsultationSession to update
     * @param transcriptOrNotes     raw transcript text or doctor notes to summarize
     */
    void generateSummaryAsync(String consultationSessionId, String transcriptOrNotes);
}
