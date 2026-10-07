"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { CalendarOff, Ellipsis, Pencil, Plus, Users, XCircle } from "lucide-react";
import AppointmentBranchSelect from "@/components/appointment/AppointmentBranchSelect";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageHeader from "@/features/doctor/components/PageHeader";
import { appointmentService } from "@/services/appointmentService";
import type { DoctorSession, DoctorSessionInput } from "@/types/appointment";

const blank: DoctorSessionInput = { hospitalId: "", hospitalName: "", specializationName: "", sessionDate: "", startTime: "", endTime: "", maxAppointments: 10, notes: "" };

export default function DoctorSchedulePage() {
  const [sessions, setSessions] = useState<DoctorSession[]>([]);
  const [form, setForm] = useState<DoctorSessionInput>(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try { setLoading(true); setSessions(await appointmentService.getMySessions()); }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Unable to load sessions."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);

  const change = <K extends keyof DoctorSessionInput>(key: K, value: DoctorSessionInput[K]) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.hospitalId || !form.hospitalName) { setError("Select a hospital branch before saving the session."); return; }
    try {
      setSaving(true); setError("");
      if (editing) await appointmentService.updateSession(editing, form); else await appointmentService.createSession(form);
      setForm(blank); setEditing(null); setShowForm(false); await load();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Unable to save session."); }
    finally { setSaving(false); }
  };

  const edit = (session: DoctorSession) => {
    setEditing(session.sessionId);
    setForm({ hospitalId: session.hospitalId, hospitalName: session.hospitalName, specializationId: session.specializationId, specializationName: session.specialization, sessionDate: session.sessionDate, startTime: session.startTime, endTime: session.endTime ?? "", maxAppointments: session.maxAppointments, notes: session.notes ?? "" });
    setShowForm(true);
  };

  const status = async (id: string, next: "HOLIDAY" | "CANCELLED") => {
    try { await appointmentService.updateSessionStatus(id, next); await load(); }
    catch (statusError) { setError(statusError instanceof Error ? statusError.message : "Unable to update session."); }
  };

  const closeMenu = (element: HTMLElement) => { element.closest("details")?.removeAttribute("open"); };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Doctor channeling" title="Sessions & schedule" description="Create capacity-based sessions and manage your future channeling schedule." action={<Button type="button" size="lg" leftIcon={<Plus className="h-4 w-4" />} onClick={() => { setEditing(null); setForm(blank); setShowForm((visible) => !visible); }}>{showForm ? "Close" : "Create Session"}</Button>} />
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert">{error}</div>}
      {showForm && <Card className="p-5 sm:p-6"><form onSubmit={submit}>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Session details</p><h2 className="mt-1 text-lg font-bold text-slate-900">{editing ? "Edit session" : "New doctor session"}</h2></div><Badge variant="primary" size="md">Select a branch</Badge></div>
        <p className="mt-2 text-sm text-slate-500">Patients will see this branch when searching and booking your session.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AppointmentBranchSelect value={form.hospitalId} onChange={(hospitalId, hospitalName) => setForm((current) => ({ ...current, hospitalId, hospitalName }))} required disabled={Boolean(editing && sessions.find((session) => session.sessionId === editing)?.activeAppointments)} />
          <Input label="Specialization *" value={form.specializationName} onChange={(value) => change("specializationName", value)} />
          <Input label="Date *" type="date" min={new Date().toISOString().slice(0, 10)} value={form.sessionDate} onChange={(value) => change("sessionDate", value)} />
          <Input label="Start Time *" type="time" value={form.startTime} onChange={(value) => change("startTime", value)} />
          <Input label="End Time" type="time" value={form.endTime ?? ""} onChange={(value) => change("endTime", value)} />
          <Input label="Maximum Appointments *" type="number" min="1" value={String(form.maxAppointments)} onChange={(value) => change("maxAppointments", Number(value))} />
          <Input label="Notes" value={form.notes ?? ""} onChange={(value) => change("notes", value)} />
        </div>
        <div className="mt-6 flex justify-end"><Button type="submit" size="lg" isLoading={saving}>{editing ? "Save Changes" : "Create Session"}</Button></div>
      </form></Card>}
      {loading ? <Card className="p-10 text-center text-sm text-slate-500" role="status">Loading sessions...</Card> : sessions.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">No sessions created yet.</div> :
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Upcoming sessions</p><h2 className="mt-1 font-bold text-slate-900">Schedule overview</h2></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[940px] text-left text-sm"><thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500"><tr>{["Date", "Time", "Hospital", "Capacity", "Remaining", "Status", "Actions"].map((heading) => <th key={heading} scope="col" className="px-5 py-4 first:pl-6 last:pr-6">{heading}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">{sessions.map((session, index) => <tr key={session.sessionId} className="text-slate-600 transition-colors hover:bg-blue-50/40">
              <td className="px-5 py-5 pl-6 font-semibold text-slate-900">{session.sessionDate}<span className="mt-1 block text-xs font-normal capitalize text-slate-400">{session.dayOfWeek.toLowerCase()}</span></td>
              <td className="whitespace-nowrap px-5 py-5 font-medium text-slate-700">{session.startTime}{session.endTime ? ` – ${session.endTime}` : ""}</td>
              <td className="max-w-[240px] px-5 py-5 font-medium text-slate-700">{session.hospitalName}</td>
              <td className="whitespace-nowrap px-5 py-5"><span className="font-bold text-slate-900">{session.activeAppointments} / {session.maxAppointments}</span><span className="ml-1 text-xs text-slate-500">booked</span></td>
              <td className="px-5 py-5"><span className="font-bold text-slate-900">{session.remainingAppointments}</span><span className="ml-1 text-xs text-slate-500">slots</span></td>
              <td className="px-5 py-5"><Badge variant="primary" size="md" dot className="font-semibold uppercase">{session.status}</Badge></td>
              <td className="px-5 py-5 pr-6"><div className="flex items-center justify-end gap-2"><Link href={`/doctor/sessions/${session.sessionId}/queue`} className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"><Users className="h-4 w-4" />View Queue</Link>
                <details className="group relative [&[open]]:z-30"><summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 [&::-webkit-details-marker]:hidden" aria-label={`More actions for ${session.sessionDate}`}><Ellipsis className="h-5 w-5" /></summary>
                  <div className={`absolute right-0 z-30 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ${index >= sessions.length - 2 ? "bottom-full mb-2" : "top-full mt-2"}`}>
                    <button type="button" onClick={(event) => { closeMenu(event.currentTarget); edit(session); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"><Pencil className="h-4 w-4" />Edit Session</button>
                    <button type="button" onClick={(event) => { closeMenu(event.currentTarget); void status(session.sessionId, "HOLIDAY"); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"><CalendarOff className="h-4 w-4" />Mark as Holiday</button>
                    <div className="my-1 border-t border-slate-100" />
                    <button type="button" onClick={(event) => { closeMenu(event.currentTarget); void status(session.sessionId, "CANCELLED"); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"><XCircle className="h-4 w-4" />Cancel Session</button>
                  </div>
                </details>
              </div></td>
            </tr>)}</tbody>
          </table></div>
        </div>}
    </div>
  );
}

function Input({ label, value, onChange, type = "text", min }: { label: string; value: string; onChange: (value: string) => void; type?: string; min?: string }) {
  return <label className="space-y-2"><span className="text-sm font-medium text-slate-700">{label}</span><input required={label.includes("*")} type={type} min={min} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>;
}
