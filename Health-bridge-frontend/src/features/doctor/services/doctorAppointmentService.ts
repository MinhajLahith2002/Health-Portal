import api from "@/lib/axios";
import { getStoredUser } from "@/lib/auth";
import { Appointment } from "@/types/appointment";

export type DoctorDecision = "PENDING" | "ACCEPTED" | "REJECTED";

export type DoctorAppointment = Appointment & {
  doctorDecision: DoctorDecision;
};

const getDoctorId = () => {
  const user = getStoredUser();
  if (!user) return "doc-002";

  const userId = user.id ?? "";
  if (userId.startsWith("doc-")) return userId;

  const email = (user.email ?? "").trim().toLowerCase();
  if (email === "doctor@healthbridge.lk") return "doc-002";

  const fullName = (user.fullName ?? "").trim().toLowerCase();
  if (fullName.includes("maya perera")) return "doc-002";
  if (fullName.includes("robert chen")) return "doc-001";

  return userId || "doc-002";
};

const normalizeDecision = (appointment: DoctorAppointment): DoctorAppointment => ({
  ...appointment,
  doctorDecision: appointment.doctorDecision ||
    (appointment.status === "COMPLETED" ? "ACCEPTED" : appointment.status === "CANCELLED" ? "REJECTED" : "PENDING"),
});

export async function getDoctorAppointments(): Promise<DoctorAppointment[]> {
  const appointments = await api.get<DoctorAppointment[]>(
    `/appointments?doctorId=${encodeURIComponent(getDoctorId())}`
  );
  return appointments.map(normalizeDecision);
}

export async function updateDoctorAppointmentDecision(
  appointment: DoctorAppointment,
  decision: DoctorDecision
): Promise<DoctorAppointment> {
  return api.patch<DoctorAppointment>(
    `/appointments/${encodeURIComponent(appointment.id)}/decision?decision=${decision}`
  );
}

export async function markAppointmentCompleted(
  appointment: DoctorAppointment
): Promise<DoctorAppointment> {
  return api.patch<DoctorAppointment>(`/appointments/${encodeURIComponent(appointment.id)}/complete`);
}
