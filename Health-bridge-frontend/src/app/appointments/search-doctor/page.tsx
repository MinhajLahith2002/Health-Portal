"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, Hospital, Search, Stethoscope } from "lucide-react";
import AppointmentBranchSelect from "@/components/appointment/AppointmentBranchSelect";
import AppointmentModuleShell from "@/components/appointment/AppointmentModuleShell";
import { useAuth } from "@/hooks/useAuth";
import { appointmentService } from "@/services/appointmentService";
import type { PublicDoctorSession, SessionSearchFilters, SessionStatus } from "@/types/appointment";

const statusText: Record<SessionStatus, string> = {
  AVAILABLE: "Available",
  FULL: "Fully booked",
  HOLIDAY: "Holiday",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};
const statusTone: Record<SessionStatus, string> = {
  AVAILABLE: "bg-emerald-50 text-emerald-700",
  FULL: "bg-amber-50 text-amber-700",
  HOLIDAY: "bg-violet-50 text-violet-700",
  CANCELLED: "bg-rose-50 text-rose-700",
  COMPLETED: "bg-slate-100 text-slate-600",
};
const today = new Date().toISOString().slice(0, 10);
const selectClass = "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

export default function SearchDoctorPage() {
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState<SessionSearchFilters>({});
  const [sessions, setSessions] = useState<PublicDoctorSession[]>([]);
  const [sessionCatalog, setSessionCatalog] = useState<PublicDoctorSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (filters: SessionSearchFilters = {}, refreshCatalog = false) => {
    try {
      setLoading(true);
      setError("");
      const results = await appointmentService.searchPublicSessions(filters);
      setSessions(results);
      if (refreshCatalog) setSessionCatalog(results);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load doctors.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load({}, true), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const availableSessions = useMemo(
    () => sessionCatalog.filter((session) => session.status === "AVAILABLE" && session.remainingAppointments > 0),
    [sessionCatalog],
  );

  const doctorOptions = useMemo(() => {
    const byId = new Map<string, string>();
    availableSessions.forEach((session) => {
      if (session.doctorId && session.doctorName) byId.set(session.doctorId, session.doctorName);
    });
    return Array.from(byId, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [availableSessions]);

  const specializationOptions = useMemo(() => {
    const values = new Set<string>();
    availableSessions
      .filter((session) => !form.doctorId || session.doctorId === form.doctorId)
      .forEach((session) => { if (session.specialization) values.add(session.specialization); });
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [availableSessions, form.doctorId]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void load(form);
  };

  const clear = () => {
    setForm({});
    void load({});
  };

  return <AppointmentModuleShell title="Find a Doctor" subtitle="Search doctors, explore available sessions, and book an appointment." action={<Link href="/appointments" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">View My Appointments</Link>} showTopNav={false}>
    {!isAuthenticated && <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-800"><strong>Guest browsing:</strong> You can view public doctor information and availability. Log in or register when you are ready to book.</div>}
    <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Doctor</span><select value={form.doctorId ?? ""} onChange={(event) => setForm((current) => ({ ...current, doctorId: event.target.value || undefined, specialization: undefined }))} className={selectClass} disabled={loading && sessionCatalog.length === 0}><option value="">All doctors</option>{doctorOptions.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name}</option>)}</select></label>
        <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Specialization</span><select value={form.specialization ?? ""} onChange={(event) => setForm((current) => ({ ...current, specialization: event.target.value || undefined }))} className={selectClass} disabled={loading && sessionCatalog.length === 0}><option value="">All specializations</option>{specializationOptions.map((specialization) => <option key={specialization} value={specialization}>{specialization}</option>)}</select></label>
        <AppointmentBranchSelect value={form.hospitalId ?? ""} onChange={(hospitalId) => setForm((current) => ({ ...current, hospitalId: hospitalId || undefined }))} />
        <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Date</span><input type="date" min={today} value={form.date ?? ""} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value || undefined }))} className={selectClass} /></label>
      </div>
      <div className="mt-5 flex flex-wrap gap-3"><button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"><Search className="h-4 w-4" />Search</button><button type="button" onClick={clear} className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Clear</button></div>
    </form>
    {loading ? <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">Loading available doctors...</div> : error ? <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">{error}<button onClick={() => void load(form)} className="ml-3 font-semibold underline">Retry</button></div> : sessions.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center"><h2 className="text-xl font-semibold">No matching sessions</h2><p className="mt-2 text-sm text-slate-500">Try a different date or broaden your filters.</p></div> : <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm"><table className="w-full min-w-[850px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{["Doctor", "Specialization", "Hospital", "Date & time", "Status", "Action"].map((heading) => <th key={heading} className="px-5 py-4 font-semibold">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{sessions.map((session) => { const available = session.status === "AVAILABLE" && session.remainingAppointments > 0; const bookingPath = `/appointments/book/${encodeURIComponent(session.sessionId)}`; const href = isAuthenticated && available ? bookingPath : `/login?redirect=${encodeURIComponent(bookingPath)}`; return <tr key={session.sessionId} className="text-slate-700"><td className="px-5 py-4"><div className="font-semibold text-slate-900">{session.doctorName}</div><Link href={`/appointments/session/${encodeURIComponent(session.sessionId)}`} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"><Stethoscope className="h-3 w-3" />View details</Link></td><td className="px-5 py-4">{session.specialization}</td><td className="px-5 py-4"><span className="inline-flex items-center gap-1"><Hospital className="h-4 w-4 text-blue-600" />{session.hospitalName || "—"}</span></td><td className="px-5 py-4"><div className="flex items-center gap-1"><CalendarDays className="h-4 w-4 text-blue-600" />{session.sessionDate} ({session.dayOfWeek})</div><div className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Clock3 className="h-3 w-3" />{session.startTime}{session.endTime ? ` – ${session.endTime}` : ""}</div></td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone[session.status]}`}>{statusText[session.status]}</span></td><td className="px-5 py-4"><Link href={href} className={`inline-flex whitespace-nowrap items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold ${available ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-100 text-slate-500"}`}>{isAuthenticated && available ? "Book appointment" : "Log in to book"}</Link></td></tr>; })}</tbody></table></div>}
  </AppointmentModuleShell>;
}
