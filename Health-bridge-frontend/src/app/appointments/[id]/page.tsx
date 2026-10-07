"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Video } from "lucide-react";
import AppointmentModuleShell from "@/components/appointment/AppointmentModuleShell";
import { appointmentService } from "@/services/appointmentService";
import { getApiErrorMessage } from "@/lib/axios";
import { telemedicineApi } from "@/features/telemedicine/api/telemedicineApi";
import type { Appointment, DoctorSession } from "@/types/appointment";

function AppointmentDetailsContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const confirmed = useSearchParams().get("confirmed") === "1";
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [sessions, setSessions] = useState<DoctorSession[]>([]);
  const [showReschedule, setShowReschedule] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joiningCall, setJoiningCall] = useState(false);
  const load = useCallback(async () => { try { setLoading(true); setAppointment(await appointmentService.getAppointmentById(id)); } catch(e) { setError(e instanceof Error ? e.message : "Unable to load appointment."); } finally { setLoading(false); } }, [id]);
  useEffect(()=>{ const timer=window.setTimeout(()=>void load(),0); return()=>window.clearTimeout(timer); }, [load]);
  const openReschedule = async () => { try { setError(""); setSessions((await appointmentService.searchSessions()).filter(s=>s.status === "AVAILABLE" && s.sessionId !== appointment?.sessionId)); setShowReschedule(true); } catch(e) { setError(e instanceof Error ? e.message : "Unable to load sessions."); } };
  const reschedule = async (sessionId: string) => { try { const updated = await appointmentService.rescheduleAppointment(id, sessionId); setAppointment(updated); setShowReschedule(false); } catch(e) { setError(e instanceof Error ? e.message : "Unable to reschedule."); } };
  const active = appointment?.status === "BOOKED" || appointment?.status === "UPCOMING";
  const ahead = appointment ? Math.max(appointment.appointmentNumber - appointment.currentQueueNumber - 1, 0) : 0;

  const handleJoinVideoCall = async () => {
    if (!appointment) return;
    setJoiningCall(true);
    setError("");
    try {
      let session;
      try {
        session = await telemedicineApi.getSessionByAppointmentId(id);
      } catch (lookupErr) {
        // Only a 404 means "no session yet" — anything else (401, 500, network) is a real error.
        if (!axios.isAxiosError(lookupErr) || lookupErr.response?.status !== 404) throw lookupErr;
        session = await telemedicineApi.createSession({
          appointmentId: id,
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          consultationType: "VIDEO",
          scheduledStartTime: `${appointment.date}T${appointment.sessionTime}`,
        });
      }
      router.push(`/telemedicine/consultation/${session.id}`);
    } catch (err) {
      const body = axios.isAxiosError(err) ? err.response?.data : undefined;
      setError(typeof body === "string" && body ? body : getApiErrorMessage(err, "Unable to start the video consultation. Please try again."));
    } finally {
      setJoiningCall(false);
    }
  };

  return <AppointmentModuleShell title={confirmed ? "Appointment Confirmed" : "Appointment Details"} subtitle={confirmed ? "Your booking is secured. Keep the reference number for your records." : "Review your channeling information and queue status."}>
    {loading ? <div className="rounded-3xl border bg-white p-12 text-center text-sm text-slate-500">Loading appointment...</div>
        : error && !appointment ? <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-rose-700">{error}</div>
            : appointment ? <>
              {confirmed && <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center"><p className="text-sm font-bold uppercase tracking-[.2em] text-emerald-700">Your appointment number</p><p className="mt-3 text-6xl font-black text-emerald-800">{String(appointment.appointmentNumber).padStart(2,"0")}</p></section>}
              {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><Info label="Reference Number" value={appointment.referenceNumber}/><Info label="Appointment Number" value={String(appointment.appointmentNumber).padStart(2,"0")}/><Info label="Status" value={appointment.status}/><Info label="Doctor" value={appointment.doctorName}/><Info label="Specialization" value={appointment.specialization}/><Info label="Hospital" value={appointment.hospitalName}/><Info label="Date" value={appointment.date}/><Info label="Session Time" value={appointment.sessionTime}/></div>
                {active && appointment.date === new Date().toISOString().slice(0,10) && <div className="mt-6 grid gap-4 rounded-2xl bg-blue-50 p-5 sm:grid-cols-3"><Info label="Your Number" value={String(appointment.appointmentNumber).padStart(2,"0")}/><Info label="Current Number" value={String(appointment.currentQueueNumber).padStart(2,"0")}/><Info label="Queue" value={`${ahead} patient${ahead === 1 ? "" : "s"} ahead of you`}/></div>}
                {active && appointment.appointmentType === "VIDEO" && (
                    <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-blue-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">Ready to join?</p>
                        <p className="text-xs text-slate-600">Your meeting room opens 10 minutes before the scheduled time.</p>
                      </div>
                      <button
                          type="button"
                          onClick={() => void handleJoinVideoCall()}
                          disabled={joiningCall}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                      >
                        <Video className="h-4 w-4" />
                        {joiningCall ? "Starting..." : "Join Video Consultation"}
                      </button>
                    </div>
                )}
                <div className="mt-7 flex flex-wrap gap-3"><Link href="/appointments" className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white">View My Appointments</Link><Link href="/appointments/search-doctor" className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">Back to Appointments</Link>{active && <button onClick={()=>void openReschedule()} className="rounded-2xl border border-blue-200 px-5 py-3 text-sm font-semibold text-blue-700">Reschedule</button>}</div>
              </section>
              {showReschedule && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-3xl bg-white p-6"><div className="flex justify-between"><h2 className="text-xl font-bold">Choose a new session</h2><button onClick={()=>setShowReschedule(false)} className="text-slate-500">Close</button></div><div className="mt-5 space-y-3">{sessions.length ? sessions.map(s=><button key={s.sessionId} onClick={()=>void reschedule(s.sessionId)} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 p-4 text-left hover:border-blue-300"><span><strong className="block">{s.doctorName} · {s.specialization}</strong><span className="text-sm text-slate-500">{s.hospitalName} · {s.sessionDate} at {s.startTime}</span></span><span className="text-sm font-semibold text-blue-700">Select</span></button>) : <p className="py-8 text-center text-slate-500">No alternative sessions are currently available.</p>}</div></div></div>}
            </> : null}
  </AppointmentModuleShell>;
}
export default function AppointmentDetailsPage(){return <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading appointment...</div>}><AppointmentDetailsContent/></Suspense>}
function Info({label,value}:{label:string;value:string}) { return <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 font-semibold text-slate-900">{value || "—"}</p></div>; }