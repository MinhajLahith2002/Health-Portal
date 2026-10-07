"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Video, Phone, FileText, PlayCircle, LogIn } from "lucide-react";
import AppointmentModuleShell from "@/components/appointment/AppointmentModuleShell";
import { telemedicineApi } from "@/features/telemedicine/api/telemedicineApi";
import type { SessionHistoryItem } from "@/features/telemedicine/types";
import { useAuth } from "@/hooks/useAuth";

export default function TelemedicineHistoryPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<SessionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetcher =
        user.role === "DOCTOR" ? telemedicineApi.getDoctorHistory : telemedicineApi.getPatientHistory;

    fetcher(user.id)
        .then(setItems)
        .catch(() => setItems([]))
        .finally(() => setLoading(false));
  }, [user]);

  return (
      <AppointmentModuleShell title="Telemedicine" subtitle="Your video and audio consultation history.">
        {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
              Loading history...
            </div>
        ) : items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <h2 className="text-xl font-semibold text-slate-900">No consultations yet</h2>
              <p className="mt-2 text-sm text-slate-500">
                You don&#39;t have any past telemedicine consultations yet.
              </p>
            </div>
        ) : (
            <div className="space-y-3">
              {items.map((item) => (
                  <div
                      key={item.id}
                      className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        {item.consultationType === "VIDEO" ? (
                            <Video className="text-blue-600" size={18} />
                        ) : (
                            <Phone className="text-blue-600" size={18} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">
                          {item.counterpartName ?? "Consultation"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(item.scheduledStartTime).toLocaleString()}
                          {item.durationInSeconds != null && ` · ${Math.round(item.durationInSeconds / 60)} min`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={item.status} />
                      {["SCHEDULED", "WAITING_ROOM", "IN_PROGRESS"].includes(item.status) && (
                          <button
                              onClick={() => router.push(`/telemedicine/consultation/${item.id}`)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
                          >
                            <LogIn size={14} />
                            Join
                          </button>
                      )}
                      {item.hasSummary && (
                          <button
                              onClick={() => router.push(`/telemedicine/consultation-summary/${item.id}`)}
                              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                              aria-label="View summary"
                              title="View summary"
                          >
                            <FileText size={16} />
                          </button>
                      )}
                      {item.hasRecording && (
                          <button
                              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                              aria-label="Play recording"
                              title="Play recording"
                          >
                            <PlayCircle size={16} />
                          </button>
                      )}
                    </div>
                  </div>
              ))}
            </div>
        )}
      </AppointmentModuleShell>
  );
}

function StatusBadge({ status }: { status: SessionHistoryItem["status"] }) {
  const styles: Record<string, string> = {
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    NO_SHOW: "bg-red-100 text-red-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    WAITING_ROOM: "bg-amber-100 text-amber-700",
    SCHEDULED: "bg-slate-100 text-slate-600",
  };

  return (
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${styles[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status.replace("_", " ")}
    </span>
  );
}