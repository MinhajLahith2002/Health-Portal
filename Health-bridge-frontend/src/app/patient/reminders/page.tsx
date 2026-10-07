"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, AuthUser } from "@/lib/auth";
import { Bell, Clock, CheckCircle2 } from "lucide-react";
import { reminderService } from "@/services/reminderService";
import { Reminder } from "@/types/reminder";

export default function MedicationRemindersPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      router.push("/login");
    } else {
      setUser(storedUser);
      fetchReminders(storedUser.id);
    }
  }, [router]);

  const fetchReminders = async (patientId: string) => {
    try {
      const data = await reminderService.getTodaysReminders(patientId);
      setReminders(data);
    } catch (error) {
      console.error("Failed to load reminders", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reminderId: string, newStatus: string) => {
    try {
      await reminderService.updateReminderStatus(reminderId, newStatus);
      // Instantly update the UI so the user doesn't have to wait for a refresh
      setReminders(reminders.map(r => 
        r.id === reminderId ? { ...r, status: newStatus } : r
      ));
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Error updating reminder. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  const remainingCount = reminders.filter(r => r.status === "PENDING").length;

  return (
    <>
      <main className="flex-1 p-6 sm:p-10 w-full">
        <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full pb-10">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Bell className="w-6 h-6 text-blue-600" />
                Daily Reminders
              </h1>
              <p className="text-sm text-slate-500 mt-1">Track and manage your daily medication schedules.</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-700">Today&apos;s Schedule</h3>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                {remainingCount} Remaining
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {reminders.length === 0 ? (
                 <div className="p-8 text-center text-slate-500">No reminders scheduled for today.</div>
              ) : (
                reminders.map((reminder) => (
                  <div key={reminder.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full flex-shrink-0 ${
                        reminder.status === "TAKEN" ? "bg-emerald-100 text-emerald-600" :
                        reminder.status === "PENDING" ? "bg-amber-100 text-amber-600" :
                        "bg-slate-100 text-slate-400"
                      }`}>
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className={`text-lg font-bold ${reminder.status === "TAKEN" ? "text-slate-400 line-through" : "text-slate-800"}`}>
                          {reminder.medicineName} ({reminder.dosage})
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                          <span className="font-semibold text-slate-700">{reminder.scheduledTime}</span>
                          <span>•</span>
                          <span>{reminder.instructions}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-14 sm:ml-0">
                      {reminder.status === "TAKEN" ? (
                        <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4" /> Taken
                        </div>
                      ) : reminder.status === "PENDING" ? (
                        <>
                          <button onClick={() => handleUpdateStatus(reminder.id, "TAKEN")} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition shadow-sm">
                            Mark Taken
                          </button>
                          <button onClick={() => handleUpdateStatus(reminder.id, "SKIPPED")} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-bold transition">
                            Skip
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400 font-semibold text-sm px-4 py-2 rounded-lg bg-slate-50 border border-slate-200">
                          Skipped
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
