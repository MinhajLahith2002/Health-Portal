"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, XCircle, ClipboardCheck, User } from "lucide-react";
import {
  DoctorAppointment,
  DoctorDecision,
  getDoctorAppointments,
  markAppointmentCompleted,
  updateDoctorAppointmentDecision,
} from "@/features/doctor/services/doctorAppointmentService";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));

const formatTime = (value: string) => {
  const [hoursRaw, minutes] = value.split(":");
  const hours = Number(hoursRaw);
  const suffix = hours >= 12 ? "PM" : "AM";
  const normalized = ((hours + 11) % 12) + 1;
  return `${normalized}:${minutes} ${suffix}`;
};

const getDecisionTone = (decision: DoctorDecision) => {
  if (decision === "ACCEPTED") {
    return "bg-blue-100 text-blue-700 border border-blue-200";
  }

  if (decision === "REJECTED") {
    return "bg-rose-100 text-rose-700 border border-rose-200";
  }

  return "bg-amber-100 text-amber-700 border border-amber-200";
};

const getAppointmentTone = (appointment: DoctorAppointment) => {
  if (appointment.status === "COMPLETED") {
    return "bg-slate-100 text-slate-700 border border-slate-200";
  }

  return getDecisionTone(appointment.doctorDecision);
};

const getAppointmentLabel = (appointment: DoctorAppointment) =>
  appointment.status === "COMPLETED" ? "COMPLETED" : appointment.doctorDecision;

export default function DoctorAppointmentManager() {
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await getDoctorAppointments();
        if (mounted) {
          setAppointments(result);
          setSelectedId(result[0]?.id ?? null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Unable to load doctor appointments.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedAppointment = useMemo(
    () => appointments.find((appointment) => appointment.id === selectedId) ?? appointments[0] ?? null,
    [appointments, selectedId]
  );

  const stats = useMemo(() => {
    const pending = appointments.filter((appointment) => appointment.doctorDecision === "PENDING").length;
    const accepted = appointments.filter((appointment) => appointment.doctorDecision === "ACCEPTED").length;
    const rejected = appointments.filter((appointment) => appointment.doctorDecision === "REJECTED").length;

    return { pending, accepted, rejected };
  }, [appointments]);

  const updateDecision = async (appointmentId: string, decision: DoctorDecision) => {
    const appointment = appointments.find((item) => item.id === appointmentId);
    if (!appointment) return;
    const updated = await updateDoctorAppointmentDecision(appointment, decision);
    setAppointments((current) => current.map((item) => item.id === appointmentId ? updated : item));
  };

  const handleComplete = async (appointmentId: string) => {
    const appointment = appointments.find((item) => item.id === appointmentId);
    if (!appointment) return;
    try {
      setActionError("");
      const updated = await markAppointmentCompleted(appointment);
      setAppointments((current) => current.map((item) => item.id === appointmentId ? updated : item));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to complete appointment.");
    }
  };

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm text-slate-500">Loading doctor appointments...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-rose-700">Unable to load appointments</h2>
        <p className="mt-2 text-sm text-rose-600">{error}</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-amber-700">Pending</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{stats.pending}</p>
        </article>
        <article className="rounded-3xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-blue-700">Accepted</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{stats.accepted}</p>
        </article>
        <article className="rounded-3xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-rose-700">Rejected</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{stats.rejected}</p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Booked appointments</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {appointments.length} total
            </span>
          </div>

          <div className="space-y-3">
            {appointments.map((appointment) => {
              const isSelected = selectedAppointment?.id === appointment.id;

              return (
                <button
                  key={appointment.id}
                  type="button"
                  onClick={() => setSelectedId(appointment.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    isSelected
                      ? "border-blue-200 bg-blue-50 shadow-sm"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-slate-900">{appointment.doctorName}</p>
                      <p className="text-sm text-slate-500">{appointment.reason}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${getAppointmentTone(appointment)}`}>
                      {getAppointmentLabel(appointment)}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>{formatDate(appointment.appointmentDate)}</span>
                    <span>•</span>
                    <span>{formatTime(appointment.appointmentTime)}</span>
                    <span>•</span>
                    <span>{appointment.appointmentType}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          {selectedAppointment ? (
            <>
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Patient appointment</p>
                  <h3 className="mt-2 text-xl font-bold text-slate-900">{selectedAppointment.doctorName}</h3>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${getAppointmentTone(selectedAppointment)}`}>
                  {getAppointmentLabel(selectedAppointment)}
                </span>
              </div>

              <div className="mt-5 space-y-4 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-blue-600" />
                  <span>Patient ID: {selectedAppointment.patientId}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock3 className="h-4 w-4 text-blue-600" />
                  <span>
                    {formatDate(selectedAppointment.appointmentDate)} at {formatTime(selectedAppointment.appointmentTime)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <ClipboardCheck className="h-4 w-4 text-blue-600" />
                  <span>{selectedAppointment.reason}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                {actionError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {actionError}
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => void updateDecision(selectedAppointment.id, "ACCEPTED")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Accept appointment
                </button>

                <button
                  type="button"
                  onClick={() => void updateDecision(selectedAppointment.id, "REJECTED")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                >
                  <XCircle className="h-4 w-4" />
                  Reject appointment
                </button>

                <button
                  type="button"
                  onClick={() => void handleComplete(selectedAppointment.id)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                >
                  <ClipboardCheck className="h-4 w-4" />
                  Mark consultation completed
                </button>
              </div>
            </>
          ) : (
            <div className="py-10 text-center text-sm text-slate-500">No appointment selected.</div>
          )}
        </div>
      </section>
    </div>
  );
}
