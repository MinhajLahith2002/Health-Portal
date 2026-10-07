"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarDays, Clock3, Hospital, LogIn } from "lucide-react";
import AppointmentModuleShell from "@/components/appointment/AppointmentModuleShell";
import { appointmentService } from "@/services/appointmentService";
import { useAuth } from "@/hooks/useAuth";
import type { PublicDoctorSession } from "@/types/appointment";

export default function PublicSessionDetailsPage() {
  const params = useParams<{ sessionId: string }>(); const { isAuthenticated } = useAuth(); const [session, setSession] = useState<PublicDoctorSession | null>(null); const [error, setError] = useState("");
  useEffect(() => { if (params.sessionId) void appointmentService.getPublicSession(params.sessionId).then(setSession).catch(e => setError(e instanceof Error ? e.message : "Unable to load doctor details.")); }, [params.sessionId]);
  const bookingPath = session ? `/appointments/book/${encodeURIComponent(session.sessionId)}` : "/appointments/search-doctor";
  return <AppointmentModuleShell title="Doctor & Session Details" subtitle="Public appointment information"><Link href="/appointments/search-doctor" className="text-sm font-semibold text-blue-600 hover:underline">← Back to doctor listing</Link>{error ? <div className="mt-6 rounded-2xl bg-rose-50 p-6 text-rose-700">{error}</div> : !session ? <div className="mt-6 rounded-2xl bg-white p-10 text-center text-slate-500">Loading doctor details...</div> : <div className="mt-6 max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-2xl font-bold text-slate-900">{session.doctorName}</h2><p className="mt-2 text-lg font-medium text-blue-700">{session.specialization}</p><div className="mt-6 grid gap-4 text-sm text-slate-600"><p className="flex items-center gap-2"><Hospital className="h-5 w-5 text-blue-600" />{session.hospitalName || "Hospital not specified"}</p><p className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-blue-600" />{session.sessionDate} ({session.dayOfWeek})</p><p className="flex items-center gap-2"><Clock3 className="h-5 w-5 text-blue-600" />{session.startTime}{session.endTime ? ` – ${session.endTime}` : ""}</p><p>{session.remainingAppointments > 0 ? `${session.remainingAppointments} appointment slots remaining` : "No appointment slots remaining"}</p></div><Link href={isAuthenticated && session.status === "AVAILABLE" && session.remainingAppointments > 0 ? bookingPath : `/login?redirect=${encodeURIComponent(bookingPath)}`} className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700">{isAuthenticated ? "Book appointment" : <><LogIn className="h-4 w-4" />Log in to book</>}</Link></div>}</AppointmentModuleShell>;
}
