"use client";

import Link from "next/link";
import { Appointment } from "@/types/appointment";

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: (appointment: Appointment) => void;
}

const statusStyles = {
  BOOKED: "bg-blue-50 text-blue-700 border-blue-200",
  UPCOMING: "bg-emerald-50 text-emerald-700 border-emerald-200",
  COMPLETED: "bg-slate-100 text-slate-700 border-slate-200",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
  NO_SHOW: "bg-amber-50 text-amber-700 border-amber-200",
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));

const formatTime = (time: string) => {
  const [hoursRaw, minutes] = time.split(":");
  const hours = Number(hoursRaw);
  const suffix = hours >= 12 ? "PM" : "AM";
  const normalizedHours = ((hours + 11) % 12) + 1;
  return `${normalizedHours}:${minutes} ${suffix}`;
};

export default function AppointmentCard({
  appointment,
  onCancel,
}: AppointmentCardProps) {
  const isUpcoming = appointment.status === "UPCOMING" || appointment.status === "BOOKED";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold text-slate-900">
              {appointment.doctorName}
            </h3>
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                statusStyles[appointment.status]
              }`}
            >
              {appointment.status}
            </span>
          </div>

          <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <p>
              <span className="font-medium text-slate-900">Appointment ID:</span>{" "}
              {appointment.id}
            </p>
            <p>
              <span className="font-medium text-slate-900">Specialization:</span>{" "}
              {appointment.doctorSpecialization}
            </p>
            <p>
              <span className="font-medium text-slate-900">Date:</span>{" "}
              {formatDate(appointment.appointmentDate)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Time:</span>{" "}
              {formatTime(appointment.appointmentTime)}
            </p>
            {appointment.hospital ? (
              <p>
                <span className="font-medium text-slate-900">Hospital:</span>{" "}
                {appointment.hospital}
              </p>
            ) : null}
            <p>
              <span className="font-medium text-slate-900">Visit Type:</span>{" "}
              {appointment.appointmentType === "VIDEO"
                ? "Video Consultation"
                : "In-person"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
            <span className="font-medium text-slate-900">Reason:</span>{" "}
            {appointment.reason}
          </div>
        </div>

        <div className="flex min-w-[180px] flex-col gap-2">
          <Link
            href={`/appointments/${appointment.id}`}
            className="rounded-xl border border-blue-200 px-4 py-2 text-center text-sm font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
          >
            View Details
          </Link>
          {isUpcoming ? (
            <>
              <Link
                href={`/appointments/${appointment.id}?mode=reschedule`}
                className="rounded-xl border border-slate-200 px-4 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Reschedule
              </Link>
              <button
                type="button"
                onClick={() => onCancel?.(appointment)}
                className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
              >
                Cancel
              </button>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}
