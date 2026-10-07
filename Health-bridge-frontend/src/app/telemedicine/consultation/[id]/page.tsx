"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, Clock, Video, Phone, ShieldCheck } from "lucide-react";
import { telemedicineApi } from "@/features/telemedicine/api/telemedicineApi";
import type { TelemedicineSession } from "@/features/telemedicine/types";

export default function ConsultationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [session, setSession] = useState<TelemedicineSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    telemedicineApi
      .getSession(id)
      .then(setSession)
      .catch(() => setError("This consultation could not be found."));
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading consultation details...</p>
      </div>
    );
  }

  const scheduled = new Date(session.scheduledStartTime);
  const canJoin = ["SCHEDULED", "WAITING_ROOM", "IN_PROGRESS"].includes(session.status);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            {session.consultationType === "VIDEO" ? (
              <Video className="text-blue-600" size={22} />
            ) : (
              <Phone className="text-blue-600" size={22} />
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              {session.consultationType === "VIDEO" ? "Video" : "Audio"} Consultation
            </h1>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles(session.status)}`}
            >
              {session.status.replace("_", " ")}
            </span>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <DetailRow icon={<Calendar size={16} />} label="Date">
            {scheduled.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </DetailRow>
          <DetailRow icon={<Clock size={16} />} label="Time">
            {scheduled.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
          </DetailRow>
          <DetailRow icon={<ShieldCheck size={16} />} label="Room code">
            <span className="font-mono">{session.roomCode}</span>
          </DetailRow>
        </div>

        {session.recordingEnabled && (
          <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mb-6">
            This consultation may be recorded for clinical record-keeping. You&#39;ll be asked to
            confirm consent before recording starts.
          </p>
        )}

        <button
          disabled={!canJoin}
          onClick={() => router.push(`/telemedicine/waiting-room?sessionId=${session.id}`)}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium transition-colors"
        >
          {canJoin ? "Enter waiting room" : "Consultation unavailable"}
        </button>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-slate-400">{icon}</span>
      <span className="text-slate-500 w-16">{label}</span>
      <span className="text-slate-800 font-medium">{children}</span>
    </div>
  );
}

function statusStyles(status: string): string {
  switch (status) {
    case "IN_PROGRESS":
      return "bg-green-100 text-green-700";
    case "WAITING_ROOM":
      return "bg-amber-100 text-amber-700";
    case "COMPLETED":
      return "bg-slate-100 text-slate-600";
    case "CANCELLED":
    case "NO_SHOW":
      return "bg-red-100 text-red-700";
    default:
      return "bg-blue-100 text-blue-700";
  }
}
