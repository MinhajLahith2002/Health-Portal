"use client";

import { Appointment } from "@/types/appointment";
import AppointmentCard from "@/components/appointment/AppointmentCard";

interface AppointmentTableProps {
  appointments: Appointment[];
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  onCancel?: (appointment: Appointment) => void;
}

export default function AppointmentTable({
  appointments,
  title,
  description,
  emptyTitle,
  emptyDescription,
  onCancel,
}: AppointmentTableProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      {appointments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <h3 className="text-lg font-semibold text-slate-900">{emptyTitle}</h3>
          <p className="mt-2 text-sm text-slate-500">{emptyDescription}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onCancel={onCancel}
            />
          ))}
        </div>
      )}
    </section>
  );
}
