"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CalendarDays, Clock3, Hospital, Users } from "lucide-react";
import AppointmentModuleShell from "@/components/appointment/AppointmentModuleShell";
import api from "@/lib/axios";
import { appointmentService } from "@/services/appointmentService";
import { useAuth } from "@/hooks/useAuth";
import type { BookingInput, DoctorSession } from "@/types/appointment";

type Profile = { fullName?: string; phoneNumber?: string; phone?: string; email?: string; address?: string };
const empty: BookingInput = { sessionId: "", patientName: "", patientPhone: "", nicOrPassport: "", email: "", address: "" };

export default function SessionBookingPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [session, setSession] = useState<DoctorSession | null>(null);
  const [form, setForm] = useState<BookingInput>({ ...empty, sessionId });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(`/appointments/book/${sessionId}`)}`);
      return;
    }
    let active = true;
    Promise.all([appointmentService.getSession(sessionId), api.get<Profile>("/users/profile").catch(()=>({} as Profile))])
      .then(([details, profile]) => { if (!active) return; setSession(details); setForm({ sessionId, patientName: profile.fullName ?? "", patientPhone: profile.phoneNumber ?? profile.phone ?? "", nicOrPassport: "", email: profile.email ?? "", address: profile.address ?? "" }); })
      .catch(e => active && setError(e instanceof Error ? e.message : "Unable to load booking details."))
      .finally(()=>active && setLoading(false));
    return () => { active = false; };
  }, [sessionId, isAuthenticated, router]);
  const set = (key: keyof BookingInput, value: string) => setForm(current => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError("");
    if (!form.patientName.trim() || !form.patientPhone.trim() || !form.nicOrPassport.trim()) { setError("Full name, phone, and NIC / passport are required."); return; }
    if (!/^[+0-9() -]{7,20}$/.test(form.patientPhone)) { setError("Please enter a valid phone number."); return; }
    try { setSubmitting(true); const result = await appointmentService.book(form); router.push(`/appointments/${result.appointmentId}?confirmed=1`); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to complete the booking. Please try again."); }
    finally { setSubmitting(false); }
  };
  return <AppointmentModuleShell title="Book Appointment" subtitle="Confirm the session and provide the patient details used for this booking.">
    {loading ? <div className="rounded-3xl border bg-white p-12 text-center text-sm text-slate-500">Loading booking details...</div>
    : !session ? <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-rose-700">{error || "Session not found."}</div>
    : <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <aside className="h-fit rounded-3xl border border-blue-100 bg-blue-50 p-6"><p className="text-xs font-bold uppercase tracking-widest text-blue-600">Session summary</p><h2 className="mt-3 text-2xl font-bold text-slate-900">{session.doctorName}</h2><p className="mt-1 font-medium text-blue-700">{session.specialization}</p><div className="mt-6 space-y-4 text-sm text-slate-700"><p className="flex gap-3"><Hospital className="h-5 w-5 text-blue-600" />{session.hospitalName}</p><p className="flex gap-3"><CalendarDays className="h-5 w-5 text-blue-600" />{session.sessionDate} · {session.dayOfWeek}</p><p className="flex gap-3"><Clock3 className="h-5 w-5 text-blue-600" />{session.startTime}{session.endTime ? ` – ${session.endTime}` : ""}</p><p className="flex gap-3"><Users className="h-5 w-5 text-blue-600" />{session.activeAppointments} booked · {session.remainingAppointments} remaining</p></div></aside>
      <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold text-slate-900">Patient details</h2><p className="mt-1 text-sm text-slate-500">Your appointment number is assigned securely after confirmation.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Full Name *"><input required maxLength={120} value={form.patientName} onChange={e=>set("patientName",e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400" /></Field>
          <Field label="Phone *"><input required inputMode="tel" value={form.patientPhone} onChange={e=>set("patientPhone",e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400" /></Field>
          <Field label="NIC / Passport *"><input required minLength={5} maxLength={30} value={form.nicOrPassport} onChange={e=>set("nicOrPassport",e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400" /></Field>
          <Field label="Email"><input type="email" value={form.email ?? ""} onChange={e=>set("email",e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400" /></Field>
          <label className="space-y-2 sm:col-span-2"><span className="text-sm font-medium text-slate-700">Address</span><textarea rows={3} maxLength={300} value={form.address ?? ""} onChange={e=>set("address",e.target.value)} className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400" /></label>
        </div>
        {error && <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={()=>router.back()} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">Back</button><button disabled={submitting || session.status !== "AVAILABLE"} className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Confirming..." : "Confirm Appointment"}</button></div>
      </form>
    </div>}
  </AppointmentModuleShell>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="space-y-2"><span className="text-sm font-medium text-slate-700">{label}</span>{children}</label>; }
