export type ConsultationType = "VIDEO" | "AUDIO";

export type SessionStatus =
  | "SCHEDULED"
  | "WAITING_ROOM"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type AiSummaryStatus = "NOT_REQUESTED" | "PENDING" | "COMPLETED" | "FAILED";

export interface TelemedicineSession {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  roomCode: string;
  consultationType: ConsultationType;
  status: SessionStatus;
  scheduledStartTime: string;
  actualStartTime?: string;
  endTime?: string;
  durationInSeconds?: number;
  recordingEnabled: boolean;
  signalingUrl: string;
}

export interface CreateSessionPayload {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  consultationType: ConsultationType;
  scheduledStartTime: string;
  recordingEnabled?: boolean;
}

export interface JoinSessionPayload {
  userId: string;
  role: "PATIENT" | "DOCTOR";
}

export interface EndSessionPayload {
  doctorNotes?: string;
  requestAiSummary?: boolean;
  screenSharingUsed?: boolean;
}

export interface ConsultationSummary {
  id: string;
  telemedicineSessionId: string;
  doctorNotes?: string;
  aiGeneratedSummary?: string;
  aiSummaryStatus: AiSummaryStatus;
  keySymptomsDiscussed?: string[];
  followUpActions?: string[];
  followUpRequired: boolean;
  followUpDate?: string;
  recordingUrl?: string;
}

export interface SessionHistoryItem {
  id: string;
  counterpartId: string;
  counterpartName?: string;
  consultationType: ConsultationType;
  status: SessionStatus;
  scheduledStartTime: string;
  durationInSeconds?: number;
  hasRecording: boolean;
  hasSummary: boolean;
}

/** Messages exchanged over the signaling WebSocket */
export type SignalingMessageType =
  | "peer-joined"
  | "peer-left"
  | "offer"
  | "answer"
  | "ice-candidate"
  | "chat"
  | "screen-share-toggle";

export interface SignalingMessage {
  type: SignalingMessageType;
  senderId: string;
  roomCode: string;
  payload?: string;
}
