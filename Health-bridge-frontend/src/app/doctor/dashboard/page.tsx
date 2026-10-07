/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, CircleDollarSign, Stethoscope, UserRound, UsersRound, PlaneTakeoff, ArrowRight, Video } from "lucide-react";
import DoctorStatsCard from "@/features/doctor/components/DoctorStatsCard";
import PageHeader from "@/features/doctor/components/PageHeader";
import StatusBadge from "@/features/doctor/components/StatusBadge";
import { getDoctorProfile, getEarnings } from "@/features/doctor/services/doctorService";
import type { Doctor, Earnings } from "@/features/doctor/types";
import { appointmentService } from "@/services/appointmentService";
import type { DoctorSession } from "@/types/appointment";

export default function DoctorDashboardPage() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [sessions, setSessions] = useState<DoctorSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [todayAppointmentsCount, setTodayAppointmentsCount] = useState<number>(0);
  const [remainingSlotsCount, setRemainingSlotsCount] = useState<number>(0);

  useEffect(() => {
    let active = true;

    const loadProfile = () => {
      getDoctorProfile()
          .then((profile) => {
            if (active) {
              setDoctor(profile);
            }
          })
          .catch(() => {});
    };

    loadProfile();

    window.addEventListener("user-profile-updated", loadProfile);
    window.addEventListener("storage", loadProfile);

    return () => {
      active = false;
      window.removeEventListener("user-profile-updated", loadProfile);
      window.removeEventListener("storage", loadProfile);
    };
  }, []);

  useEffect(() => {
    let active = true;
    setSessionsLoading(true);

    appointmentService
      .getMySessions()
      .then((data) => {
        if (!active) return;
        const list = data || [];
        setSessions(list);
        
        const booked = list.reduce((acc, s) => acc + (s.activeAppointments || 0), 0);
        const remaining = list.reduce((acc, s) => acc + (s.remainingAppointments || 0), 0);
        setTodayAppointmentsCount(booked);
        setRemainingSlotsCount(remaining);
      })
      .catch(() => {
        if (active) {
          setSessions([]);
          setTodayAppointmentsCount(0);
          setRemainingSlotsCount(0);
        }
      })
      .finally(() => {
        if (active) {
          setSessionsLoading(false);
        }
      });

    appointmentService
      .getAppointments()
      .then((appList) => {
        if (active && appList && appList.length > 0) {
          setTodayAppointmentsCount(appList.length);
        }
      })
      .catch(() => {});

    getEarnings()
      .then((data) => {
        if (active) setEarnings(data);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const todayStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const doctorName = doctor?.fullName || "Doctor";

  return (
    <>
      <PageHeader 
        eyebrow={todayStr} 
        title={`Good morning, ${doctorName.startsWith("Dr.") ? doctorName : `Dr. ${doctorName}`}`} 
        description="Here is your clinical overview and schedule for today." 
      />
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <DoctorStatsCard 
          label="Today's appointments" 
          value={String(todayAppointmentsCount)} 
          detail={remainingSlotsCount > 0 ? `${remainingSlotsCount} slots remaining` : "No active slots remaining"} 
          icon={UsersRound} 
        />
        <DoctorStatsCard 
          label="Monthly earnings" 
          value={earnings ? `LKR ${(earnings.monthlyEarnings / 1000).toFixed(1)}K` : "LKR 0"} 
          detail="12.4% above last month" 
          icon={CircleDollarSign} 
          tone="amber" 
        />
        <DoctorStatsCard 
          label="Patient rating" 
          value={doctor?.rating ? `${doctor.rating} / 5` : "5.0 / 5"} 
          detail="From verified patient reviews" 
          icon={Stethoscope} 
          tone="rose" 
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-bold">Upcoming schedule</h2>
              <p className="mt-1 text-xs text-slate-500">Availability across the next working days</p>
            </div>
            <Link href="/doctor/schedule" className="text-sm font-semibold text-blue-700">
              View calendar
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {sessionsLoading ? (
              <div className="p-6 text-center text-sm text-slate-500">Loading schedule...</div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No upcoming sessions created yet.
              </div>
            ) : (
              sessions.slice(0, 4).map((slot) => {
                const dateObj = new Date(`${slot.sessionDate}T00:00:00`);
                const isValidDate = !isNaN(dateObj.getTime());
                return (
                  <div key={slot.sessionId} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 flex-col items-center justify-center rounded-md bg-slate-100">
                        <span className="text-[10px] font-bold uppercase text-slate-500">
                          {isValidDate ? dateObj.toLocaleDateString("en", { month: "short" }) : "SLOT"}
                        </span>
                        <span className="text-sm font-bold">
                          {isValidDate ? dateObj.getDate() : "--"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{slot.hospitalName || "Clinic availability"}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {slot.startTime}{slot.endTime ? ` - ${slot.endTime}` : ""}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={slot.status === "AVAILABLE" ? "Available" : slot.status} />
                  </div>
                );
              })
            )}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold">Profile summary</h2>
            <div className="mt-5 flex items-center gap-4">
              <img 
                src={doctor?.profileImage || "https://i.pravatar.cc/320?img=47"} 
                alt={doctorName} 
                className="h-16 w-16 rounded-md object-cover" 
              />
              <div>
                <p className="font-bold">{doctorName.startsWith("Dr.") ? doctorName : `Dr. ${doctorName}`}</p>
                <p className="text-sm text-blue-700">{doctor?.specialization || "General Medicine"}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {doctor?.qualifications && doctor.qualifications.length > 0 
                    ? doctor.qualifications.join(" · ") 
                    : "MBBS"}
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm">
              <div>
                <p className="text-xs text-slate-500">Experience</p>
                <p className="font-semibold">{doctor?.experience || 0} years</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Consultation</p>
                <p className="font-semibold">
                  LKR {doctor?.consultationFee ? doctor.consultationFee.toLocaleString() : "0"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold">Quick actions</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { href: "/doctor/profile", label: "Edit profile", icon: UserRound },
                { href: "/telemedicine/history", label: "Telemedicine", icon: Video },
                { href: "/doctor/schedule", label: "Add schedule", icon: CalendarDays },
                { href: "/doctor/leave", label: "Apply leave", icon: PlaneTakeoff },
                { href: "/doctor/earnings", label: "View earnings", icon: CircleDollarSign }
              ].map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className="flex min-h-20 flex-col justify-between rounded-md border border-slate-200 p-3 text-sm font-semibold hover:border-blue-300 hover:bg-blue-50">
                  <Icon className="h-5 w-5 text-blue-600" />
                  <span className="flex items-center justify-between">
                    {label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="mt-6 rounded-lg bg-blue-700 p-6 text-white">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-blue-100">Consultation income this month</p>
            <p className="mt-1 text-3xl font-bold">
              LKR {(earnings?.consultationIncome || 0).toLocaleString()}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-sm text-blue-100">Total consultations</p>
            <p className="mt-1 text-xl font-bold">
              {earnings?.payments?.length || 0} completed
            </p>
          </div>
        </div>
      </section>
    </>
  );
}