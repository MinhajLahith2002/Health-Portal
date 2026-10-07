"use client";

import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import AppointmentModuleShell from "@/components/appointment/AppointmentModuleShell";
import { appointmentService } from "@/services/appointmentService";
import type { Appointment } from "@/types/appointment";

type Tab = "Upcoming" | "Completed" | "Cancelled";

const canCancelAppointment = (appointment: Appointment) =>
  new Date(`${appointment.date}T${appointment.sessionTime}`).getTime() - Date.now() >= 24 * 60 * 60 * 1000;

export default function AppointmentsPage() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [tab, setTab] = useState<Tab>("Upcoming");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancel, setCancel] = useState<Appointment | null>(null);
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setItems(await appointmentService.getAppointments());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load appointments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const tabCounts = useMemo(
    () => ({
      Upcoming: items.filter((a) => ["BOOKED", "UPCOMING"].includes(a.status)).length,
      Completed: items.filter((a) => ["COMPLETED", "NO_SHOW"].includes(a.status)).length,
      Cancelled: items.filter((a) => a.status === "CANCELLED").length,
    }),
    [items],
  );

  const visible = useMemo(
    () =>
      items.filter((a) =>
        tab === "Upcoming"
          ? ["BOOKED", "UPCOMING"].includes(a.status)
          : tab === "Completed"
            ? ["COMPLETED", "NO_SHOW"].includes(a.status)
            : a.status === "CANCELLED",
      ),
    [items, tab],
  );

  const confirmCancel = async () => {
    if (!cancel) return;

    try {
      await appointmentService.cancelAppointment({ appointmentId: cancel.appointmentId, reason });
      setCancel(null);
      setReason("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to cancel appointment.");
    }
  };

  const emptyStateCopy: Record<
    Tab,
    { title: string; description: string; showCta?: boolean }
  > = {
    Upcoming: {
      title: "No upcoming appointments",
      description: "You don't have any upcoming appointments yet.",
      showCta: true,
    },
    Completed: {
      title: "No completed appointments",
      description: "Your completed appointments will appear here.",
    },
    Cancelled: {
      title: "No cancelled appointments",
      description: "Your cancelled appointments will appear here.",
    },
  };

  return (
    <AppointmentModuleShell
      title="My Appointments"
      subtitle="View, manage, and track your healthcare appointments."
      action={
        <Link
          href="/appointments/search-doctor"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          + Find a Doctor
        </Link>
      }
      showTopNav={false}
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white px-2 py-2 shadow-sm">
          <nav aria-label="Appointment status" className="flex items-center gap-1 overflow-x-auto">
            {(["Upcoming", "Completed", "Cancelled"] as Tab[]).map((value) => {
              const isActive = tab === value;
              const count = tabCounts[value];

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTab(value)}
                  className={`group inline-flex items-center gap-2 whitespace-nowrap px-2 py-2 text-sm font-semibold transition ${
                    isActive ? "text-blue-600" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span
                    className={`pb-2 ${
                      isActive
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "border-b-2 border-transparent"
                    }`}
                  >
                    {value}
                  </span>
                  <span
                    className={`inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
            Loading appointments...
          </div>
        ) : visible.length === 0 ? (
          <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="w-full max-w-md text-center">
              {tab === "Upcoming" && (
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <CalendarDays className="h-8 w-8" />
                </div>
              )}

              <h2 className="mt-5 text-2xl font-semibold text-slate-900">
                {emptyStateCopy[tab].title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {emptyStateCopy[tab].description}
              </p>

              {emptyStateCopy[tab].showCta && (
                <Link
                  href="/appointments/search-doctor"
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Find a Doctor
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {visible.map((a) => {
              const today = a.date === new Date().toISOString().slice(0, 10);
              const ahead = Math.max(a.appointmentNumber - a.currentQueueNumber - 1, 0);
              const canCancelThisAppointment = canCancelAppointment(a);

              return (
                <article
                  key={a.appointmentId}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-bold text-slate-900">{a.doctorName}</h2>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-blue-700">
                          {a.status}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-blue-700">
                        {a.specialization} · {a.hospitalName}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                        <span>Ref: {a.referenceNumber}</span>
                        <span>No. {String(a.appointmentNumber).padStart(2, "0")}</span>
                        <span>
                          {a.date} at {a.sessionTime}
                        </span>
                        {today && ["BOOKED", "UPCOMING"].includes(a.status) && (
                          <span className="font-semibold text-emerald-700">
                            Current {String(a.currentQueueNumber).padStart(2, "0")} · {ahead} ahead
                          </span>
                        )}
                      </div>

                      {["BOOKED", "UPCOMING"].includes(a.status) && !canCancelThisAppointment && (
                        <p className="mt-2 text-xs font-medium text-amber-700">
                          Cancellation is unavailable within 24 hours of the session.
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/appointments/${a.appointmentId}`}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        View
                      </Link>

                      {["BOOKED", "UPCOMING"].includes(a.status) && (
                        <>
                          <Link
                            href={`/appointments/${a.appointmentId}`}
                            className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                          >
                            Reschedule
                          </Link>

                          <button
                            type="button"
                            disabled={!canCancelThisAppointment}
                            title={
                              canCancelThisAppointment
                                ? "Cancel appointment"
                                : "Appointments can only be cancelled at least 24 hours before the session."
                            }
                            onClick={() => setCancel(a)}
                            className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {cancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
              <h2 className="text-xl font-bold text-slate-900">Cancel appointment?</h2>
              <p className="mt-2 text-sm text-slate-500">
                Appointment #{cancel.appointmentNumber} will remain in your history and its number will not be reused.
              </p>

              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason (optional)"
                className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none ring-0 transition focus:border-blue-300 focus:bg-white"
              />

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCancel(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Keep
                </button>
                <button
                  type="button"
                  onClick={() => void confirmCancel()}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                >
                  Confirm cancellation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppointmentModuleShell>
  );
}
