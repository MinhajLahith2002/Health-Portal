import { apiClient } from "@/services/apiClient";
import type {
  ConsultationSummary,
  CreateSessionPayload,
  EndSessionPayload,
  JoinSessionPayload,
  SessionHistoryItem,
  TelemedicineSession,
} from "../types";

// apiClient's baseURL already includes "/api" (see services/apiClient.ts),
// so paths here only need the "/v1/telemedicine" segment.
const BASE = "/v1/telemedicine";

export const telemedicineApi = {
  createSession: (payload: CreateSessionPayload): Promise<TelemedicineSession> =>
    apiClient.post<TelemedicineSession>(`${BASE}/sessions`, payload),

  getSession: (sessionId: string): Promise<TelemedicineSession> =>
    apiClient.get<TelemedicineSession>(`${BASE}/sessions/${sessionId}`),

  getSessionByRoomCode: (roomCode: string): Promise<TelemedicineSession> =>
    apiClient.get<TelemedicineSession>(`${BASE}/sessions/by-room/${roomCode}`),

  getSessionByAppointmentId: (appointmentId: string): Promise<TelemedicineSession> =>
    apiClient.get<TelemedicineSession>(`${BASE}/sessions/by-appointment/${appointmentId}`),

  enterWaitingRoom: (sessionId: string, payload: JoinSessionPayload): Promise<TelemedicineSession> =>
    apiClient.post<TelemedicineSession>(`${BASE}/sessions/${sessionId}/waiting-room`, payload),

  joinSession: (sessionId: string, payload: JoinSessionPayload): Promise<TelemedicineSession> =>
    apiClient.post<TelemedicineSession>(`${BASE}/sessions/${sessionId}/join`, payload),

  endSession: (sessionId: string, payload: EndSessionPayload): Promise<TelemedicineSession> =>
    apiClient.post<TelemedicineSession>(`${BASE}/sessions/${sessionId}/end`, payload),

  cancelSession: (sessionId: string, reason?: string): Promise<TelemedicineSession> =>
    apiClient.post<TelemedicineSession>(`${BASE}/sessions/${sessionId}/cancel`, null, { params: { reason } }),

  markScreenSharingUsed: (sessionId: string): Promise<void> =>
    apiClient.post<void>(`${BASE}/sessions/${sessionId}/screen-share`),

  attachRecording: (sessionId: string, payload: Record<string, unknown>): Promise<void> =>
    apiClient.post<void>(`${BASE}/sessions/${sessionId}/recording`, payload),

  getSummary: (sessionId: string): Promise<ConsultationSummary> =>
    apiClient.get<ConsultationSummary>(`${BASE}/sessions/${sessionId}/summary`),

  getPatientHistory: (patientId: string): Promise<SessionHistoryItem[]> =>
    apiClient.get<SessionHistoryItem[]>(`${BASE}/patients/${patientId}/history`),

  getDoctorHistory: (doctorId: string): Promise<SessionHistoryItem[]> =>
    apiClient.get<SessionHistoryItem[]>(`${BASE}/doctors/${doctorId}/history`),
};
