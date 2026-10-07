export type SessionStatus = "AVAILABLE" | "FULL" | "HOLIDAY" | "CANCELLED" | "COMPLETED";
export type AppointmentStatus = "BOOKED" | "UPCOMING" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
export type DoctorDecision = "PENDING" | "ACCEPTED" | "REJECTED";
export type AppointmentMode = "IN_PERSON" | "VIDEO";

export interface DoctorSession {
  sessionId: string;
  doctorId: string;
  doctorName: string;
  specializationId?: string;
  specialization: string;
  hospitalId: string;
  hospitalName: string;
  sessionDate: string;
  dayOfWeek: string;
  startTime: string;
  endTime?: string;
  maxAppointments: number;
  activeAppointments: number;
  remainingAppointments: number;
  lastIssuedAppointmentNumber: number;
  currentQueueNumber: number;
  status: SessionStatus;
  notes?: string;
  appointmentType?: AppointmentMode;
}

export interface SessionSearchFilters { doctorId?: string; hospitalId?: string; specialization?: string; date?: string; }
export interface PublicDoctorSession {
  sessionId: string; doctorId: string; doctorName: string; specialization: string;
  hospitalName?: string; sessionDate: string; dayOfWeek: string; startTime: string;
  endTime?: string; remainingAppointments: number; status: SessionStatus; appointmentType?: AppointmentMode;
}
export interface DoctorSessionInput { hospitalId: string; hospitalName?: string; specializationId?: string; specializationName: string; sessionDate: string; startTime: string; endTime?: string; maxAppointments: number; notes?: string; appointmentType?: AppointmentMode; }
export interface BookingInput { sessionId: string; patientName: string; patientPhone: string; nicOrPassport: string; email?: string; address?: string; }

export interface Appointment {
  appointmentId: string;
  id: string;
  referenceNumber: string;
  appointmentNumber: number;
  sessionId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  hospitalId: string;
  hospitalName: string;
  specialization: string;
  date: string;
  sessionTime: string;
  currentQueueNumber: number;
  status: AppointmentStatus;
  patientPhone?: string;
  patientNicOrPassport?: string;
  patientEmail?: string;
  patientAddress?: string;
  cancelReason?: string;
  doctorDecision?: DoctorDecision;
  doctorSpecialization: string;
  hospital: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: AppointmentMode;
  reason: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppointmentFilters { status?: "ALL" | AppointmentStatus; query?: string; }
export interface AppointmentSummary { upcoming: number; completed: number; cancelled: number; }
export interface CancelAppointmentInput { appointmentId: string; reason?: string; }

// Kept for older appointment components that are outside the upgraded routes.
export interface DoctorAvailabilitySlot { id: string; time: string; label: string; isAvailable: boolean; }
export interface Doctor { id: string; name: string; specialization: string; hospital?: string; consultationFee?: number; rating?: number; reviews?: number; avatarUrl?: string; about?: string; appointmentType?: AppointmentMode; }
export interface AppointmentFormValues { doctorId: string; appointmentDate: string; appointmentTime: string; reason: string; }
