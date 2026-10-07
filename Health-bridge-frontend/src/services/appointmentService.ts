import api, { getApiErrorMessage, isMissingDoctorSessionsEndpoint } from "@/lib/axios";
import type { Appointment, AppointmentFilters, BookingInput, DoctorSession, DoctorSessionInput, PublicDoctorSession, SessionSearchFilters, SessionStatus } from "@/types/appointment";

const friendly = async <T>(work: Promise<T>, fallback: string): Promise<T> => {
  try { return await work; } catch (error) { throw new Error(getApiErrorMessage(error, fallback)); }
};

export const appointmentService = {
  searchPublicSessions(filters: SessionSearchFilters = {}) { const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value)); return friendly(api.get<PublicDoctorSession[]>("/public/doctor-sessions/search", { params }), "Unable to load available doctors."); },
  getPublicSession(id: string) { return friendly(api.get<PublicDoctorSession>(`/public/doctor-sessions/${encodeURIComponent(id)}`), "Unable to load this doctor session."); },
  searchSessions(filters: SessionSearchFilters = {}) {
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
    return friendly(api.get<DoctorSession[]>("/doctor-sessions/search", { params }), "Unable to load available sessions.");
  },
  getSession(id: string) { return friendly(api.get<DoctorSession>(`/doctor-sessions/${encodeURIComponent(id)}`), "Unable to load this session."); },
  getMySessions() {
    return api.get<DoctorSession[]>("/doctor-sessions/mine").catch((error) => {
      if (isMissingDoctorSessionsEndpoint(error)) return [];
      throw new Error(getApiErrorMessage(error, "Unable to load your sessions."));
    });
  },
  createSession(input: DoctorSessionInput) { return friendly(api.post<DoctorSession>("/doctor-sessions", input), "Unable to create the session."); },
  updateSession(id: string, input: DoctorSessionInput) { return friendly(api.put<DoctorSession>(`/doctor-sessions/${encodeURIComponent(id)}`, input), "Unable to update the session."); },
  updateSessionStatus(id: string, status: SessionStatus) { return friendly(api.patch<DoctorSession>(`/doctor-sessions/${encodeURIComponent(id)}/status`, undefined, { params: { status } }), "Unable to change the session status."); },
  deleteSession(id: string) { return friendly(api.delete<void>(`/doctor-sessions/${encodeURIComponent(id)}`), "Unable to delete the session."); },
  book(input: BookingInput) { return friendly(api.post<Appointment>("/appointments/book", input), "Unable to complete the booking. Please try again."); },
  getAppointments(filters?: AppointmentFilters) {
    return friendly(api.get<Appointment[]>("/appointments/my"), "Unable to load appointments.").then(items => items.filter(item => !filters?.status || filters.status === "ALL" || item.status === filters.status));
  },
  getAppointmentById(id: string) { return friendly(api.get<Appointment>(`/appointments/${encodeURIComponent(id)}`), "Unable to load the appointment."); },
  cancelAppointment({ appointmentId, reason }: { appointmentId: string; reason?: string }) { return friendly(api.patch<Appointment>(`/appointments/${encodeURIComponent(appointmentId)}/cancel`, undefined, { params: { reason } }), "Unable to cancel the appointment."); },
  rescheduleAppointment(appointmentId: string, sessionId: string) { return friendly(api.patch<Appointment>(`/appointments/${encodeURIComponent(appointmentId)}/reschedule`, { sessionId }), "Unable to reschedule the appointment."); },
  getQueue(sessionId: string) { return friendly(api.get<Appointment[]>(`/doctor-sessions/${encodeURIComponent(sessionId)}/queue`), "Unable to load the queue."); },
  updateCurrentQueue(sessionId: string, action: "start" | "previous" | "next") { return friendly(api.patch<DoctorSession>(`/doctor-sessions/${encodeURIComponent(sessionId)}/queue/current`, undefined, { params: { action } }), "Unable to update the current number."); },
  updateAppointmentQueueStatus(id: string, status: "COMPLETED" | "NO_SHOW") { return friendly(api.patch<Appointment>(`/appointments/${encodeURIComponent(id)}/queue-status`, undefined, { params: { status } }), "Unable to update the appointment."); },
};

export const appointmentMockData = { doctors: [] };
