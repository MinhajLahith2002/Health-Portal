"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Building2, CalendarDays, Clock3, Users } from "lucide-react";
import AppointmentBranchSelect from "@/components/appointment/AppointmentBranchSelect";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { appointmentService } from "@/services/appointmentService";
import type { DoctorSession } from "@/types/appointment";

export default function DoctorAppointmentsPage() {
  const [sessions, setSessions] = useState<DoctorSession[]>([]);
  const [branch, setBranch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { appointmentService.getMySessions().then(setSessions).catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load sessions.")); }, []);
  const visible = useMemo(() => sessions.filter((session) => !branch || session.hospitalId === branch), [sessions, branch]);

  return <div className="space-y-6">
    <header className="border-b border-slate-200 pb-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Patient queues</p><h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Session appointments</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Open a session to manage its numbered queue across your hospital branches.</p></header>
    {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert">{error}</div>}
    {sessions.length > 0 && <Card className="max-w-md p-4 sm:p-5"><AppointmentBranchSelect value={branch} onChange={(id) => setBranch(id)} placeholder="Filter by hospital branch" /></Card>}
    {!error && visible.length === 0 ? <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center sm:p-12"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><CalendarDays className="h-6 w-6" /></div><h2 className="mt-4 text-lg font-bold text-slate-900">{sessions.length ? "No sessions in this branch" : "No sessions created yet"}</h2><p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{sessions.length ? "Choose another branch to view its queues." : "Create your first branch-specific session before accepting appointments."}</p><Link href="/doctor/schedule" className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Create a Session</Link></section> :
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{visible.map((session) => <Card key={session.sessionId} className="flex min-h-[300px] flex-col p-5 transition hover:border-blue-200 hover:shadow-md sm:p-6">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4"><div className="min-w-0"><div className="flex items-center gap-2 text-sm font-bold text-slate-900"><CalendarDays className="h-4 w-4 shrink-0 text-blue-600" /><span>{session.sessionDate}</span></div><div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-500"><Clock3 className="h-4 w-4 shrink-0 text-slate-400" /><span>{session.startTime}{session.endTime ? ` – ${session.endTime}` : ""}</span></div></div><Badge variant="primary" size="md" dot className="shrink-0 font-semibold uppercase">{session.status}</Badge></div>
        <div className="py-5"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Building2 className="h-5 w-5" /></div><div className="min-w-0"><h2 className="font-bold leading-6 text-slate-900">{session.hospitalName}</h2><p className="mt-1 text-sm text-slate-500">{session.specialization}</p></div></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-slate-50 px-4 py-3"><p className="text-xs font-medium text-slate-500">Capacity</p><p className="mt-1 text-base font-bold text-slate-900">{session.activeAppointments} / {session.maxAppointments}</p><p className="text-xs text-slate-500">booked</p></div><div className="rounded-xl bg-blue-50 px-4 py-3"><p className="text-xs font-medium text-blue-700">Availability</p><p className="mt-1 text-base font-bold text-blue-700">{session.remainingAppointments}</p><p className="text-xs text-blue-600">remaining</p></div></div></div>
        <Link href={`/doctor/sessions/${session.sessionId}/queue`} className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"><Users className="h-4 w-4" />View Queue</Link>
      </Card>)}</div>}
  </div>;
}
