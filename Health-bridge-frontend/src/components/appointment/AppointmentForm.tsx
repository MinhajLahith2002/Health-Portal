"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AppointmentFormValues,
  Doctor,
  DoctorAvailabilitySlot,
} from "@/types/appointment";

interface AppointmentFormProps {
  doctor: Doctor;
  mode: "book" | "reschedule";
  submitLabel: string;
  isSubmitting?: boolean;
  initialValues?: Partial<AppointmentFormValues>;
  helperText?: string;
  onBack?: () => void;
  loadAvailability: (date: string) => Promise<DoctorAvailabilitySlot[]>;
  onSubmit: (values: AppointmentFormValues) => Promise<void>;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  return error instanceof Error ? error.message : fallback;
};

const getToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function AppointmentForm({
  doctor,
  mode,
  submitLabel,
  isSubmitting = false,
  initialValues,
  helperText,
  onBack,
  loadAvailability,
  onSubmit,
}: AppointmentFormProps) {
  const [appointmentDate, setAppointmentDate] = useState(
    initialValues?.appointmentDate || ""
  );
  const [appointmentTime, setAppointmentTime] = useState(
    initialValues?.appointmentTime || ""
  );
  const [reason, setReason] = useState(initialValues?.reason || "");
  const [slots, setSlots] = useState<DoctorAvailabilitySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState("");

  const today = getToday();
  const initialDate = initialValues?.appointmentDate || "";
  const initialTime = initialValues?.appointmentTime || "";

  const loadSlotsForDate = useCallback(
    async (date: string, currentSelection = appointmentTime) => {
      if (!date) {
        setSlots([]);
        setAppointmentTime("");
        return;
      }

      if (date < today) {
        setError("Appointments cannot be booked for a past date.");
        setSlots([]);
        setAppointmentTime("");
        return;
      }

      try {
        setSlotsLoading(true);
        setError("");
        const nextSlots = await loadAvailability(date);
        setSlots(nextSlots);
        const stillAvailable = nextSlots.some(
          (slot) => slot.time === currentSelection && slot.isAvailable
        );

        if (!stillAvailable) {
          setAppointmentTime("");
        }
      } catch (error: unknown) {
        setError(getErrorMessage(error, "Unable to load availability."));
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    },
    [appointmentTime, loadAvailability, today]
  );

  useEffect(() => {
    if (!initialDate) {
      return;
    }

    void Promise.resolve().then(() =>
      loadSlotsForDate(initialDate, initialTime)
    );
  }, [initialDate, initialTime, loadSlotsForDate]);

  const handleDateChange = async (value: string) => {
    setAppointmentDate(value);
    setAppointmentTime("");
    await loadSlotsForDate(value, "");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!appointmentDate) {
      setError("Please select an appointment date.");
      return;
    }

    if (appointmentDate < today) {
      setError("Appointments cannot be booked for a past date.");
      return;
    }

    if (!appointmentTime) {
      setError("Please select an available time slot.");
      return;
    }

    const selectedSlot = slots.find((slot) => slot.time === appointmentTime);
    if (!selectedSlot?.isAvailable) {
      setError("This doctor is not available at the selected time.");
      return;
    }

    try {
      await onSubmit({
        doctorId: doctor.id,
        appointmentDate,
        appointmentTime,
        reason: reason.trim(),
      });
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Unable to save appointment."));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
              Selected Doctor
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              {doctor.name}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{doctor.specialization}</p>
            {doctor.hospital ? (
              <p className="mt-2 text-sm text-slate-500">{doctor.hospital}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
              {doctor.consultationFee ? (
                <span className="rounded-full bg-white px-3 py-1">
                  Consultation Fee: Rs. {doctor.consultationFee.toLocaleString()}
                </span>
              ) : null}
              <span className="rounded-full bg-white px-3 py-1">
                Visit Type:{" "}
                {doctor.appointmentType === "VIDEO"
                  ? "Video Consultation"
                  : "In-person"}
              </span>
            </div>
          </section>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Appointment Date
              </span>
              <input
                type="date"
                min={today}
                value={appointmentDate}
                onChange={(event) => {
                  void handleDateChange(event.target.value);
                }}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <div className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Available Time Slots
              </span>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                {!appointmentDate ? (
                  <p className="text-sm text-slate-500">
                    Select a date to view doctor availability.
                  </p>
                ) : slotsLoading ? (
                  <p className="text-sm text-slate-500">Loading available slots...</p>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No time slots available for this date.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {slots.map((slot) => {
                      const isSelected = appointmentTime === slot.time;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={!slot.isAvailable}
                          onClick={() => setAppointmentTime(slot.time)}
                          className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                            isSelected
                              ? "border-blue-600 bg-blue-600 text-white"
                              : slot.isAvailable
                              ? "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                              : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                          }`}
                        >
                          {slot.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Reason for Appointment
            </span>
            <textarea
              rows={5}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Describe your symptoms or consultation reason."
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Booking Summary
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Doctor</dt>
                <dd className="font-medium text-slate-900">{doctor.name}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Specialization</dt>
                <dd className="font-medium text-slate-900">{doctor.specialization}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Appointment Date</dt>
                <dd className="font-medium text-slate-900">
                  {appointmentDate || "Not selected"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Appointment Time</dt>
                <dd className="font-medium text-slate-900">
                  {slots.find((slot) => slot.time === appointmentTime)?.label ||
                    "Not selected"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Reason</dt>
                <dd className="font-medium text-slate-900">
                  {reason.trim() || "Not provided"}
                </dd>
              </div>
            </dl>
          </section>

          {helperText ? (
            <section className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
              {helperText}
            </section>
          ) : null}

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting
                ? mode === "book"
                  ? "Booking appointment..."
                  : "Updating appointment..."
                : submitLabel}
            </button>
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back
              </button>
            ) : null}
          </div>
        </aside>
      </div>
    </form>
  );
}
