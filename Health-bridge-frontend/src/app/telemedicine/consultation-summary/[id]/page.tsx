"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Sparkles, FileText, CalendarClock, Download } from "lucide-react";
import { telemedicineApi } from "@/features/telemedicine/api/telemedicineApi";
import type { ConsultationSummary, TelemedicineSession } from "@/features/telemedicine/types";
import { useAuth } from "@/hooks/useAuth";
import { getRoleRedirectPath } from "@/lib/auth";

export default function ConsultationSummaryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [session, setSession] = useState<TelemedicineSession | null>(null);
  const [summary, setSummary] = useState<ConsultationSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout>;

    const load = async () => {
      try {
        const [sessionData, summaryData] = await Promise.all([
          telemedicineApi.getSession(id),
          telemedicineApi.getSummary(id),
        ]);
        if (cancelled) return;
        setSession(sessionData);
        setSummary(summaryData);
        setLoading(false);

        if (summaryData.aiSummaryStatus === "PENDING") {
          pollTimer = setTimeout(load, 3000);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
      clearTimeout(pollTimer);
    };
  }, [id]);

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-sm text-slate-500">Wrapping up your consultation...</p>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-slate-50 flex justify-center px-4 py-10">
        <div className="max-w-2xl w-full">
          <div className="flex items-center gap-3 mb-8">
            <CheckCircle2 className="text-green-500" size={32} />
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Consultation complete</h1>
              {session?.durationInSeconds != null && (
                  <p className="text-sm text-slate-500">
                    Duration: {Math.round(session.durationInSeconds / 60)} min
                  </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-blue-500" size={18} />
              <h2 className="font-semibold text-slate-900">AI-generated summary</h2>
            </div>

            {summary?.aiSummaryStatus === "PENDING" && (
                <p className="text-sm text-slate-500">Generating summary from this consultation...</p>
            )}
            {summary?.aiSummaryStatus === "FAILED" && (
                <p className="text-sm text-red-500">
                  We couldn't generate an AI summary this time. Your doctor's notes are below.
                </p>
            )}
            {summary?.aiSummaryStatus === "NOT_REQUESTED" && (
                <p className="text-sm text-slate-400">No AI summary was requested for this consultation.</p>
            )}
            {summary?.aiSummaryStatus === "COMPLETED" && (
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {summary.aiGeneratedSummary}
                </p>
            )}
          </div>

          {summary?.doctorNotes && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="text-slate-500" size={18} />
                  <h2 className="font-semibold text-slate-900">Doctor's notes</h2>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{summary.doctorNotes}</p>
              </div>
          )}

          {summary?.followUpRequired && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-4 flex items-start gap-3">
                <CalendarClock className="text-amber-600 shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-amber-900 text-sm">Follow-up recommended</h3>
                  {summary.followUpDate && (
                      <p className="text-sm text-amber-800 mt-1">
                        Suggested by {new Date(summary.followUpDate).toLocaleDateString()}
                      </p>
                  )}
                  {summary.followUpActions && summary.followUpActions.length > 0 && (
                      <ul className="mt-2 list-disc list-inside text-sm text-amber-800 space-y-1">
                        {summary.followUpActions.map((action, idx) => (
                            <li key={idx}>{action}</li>
                        ))}
                      </ul>
                  )}
                </div>
              </div>
          )}

          {summary?.recordingUrl && (
              <a
                  href={summary.recordingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline mb-6"
              >
                <Download size={16} />
                Download session recording
              </a>
          )}

          <div className="flex gap-3">
            <button
                onClick={() => router.push("/telemedicine/history")}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              View consultation history
            </button>
            <button
                onClick={() => router.push(user ? getRoleRedirectPath(user.role) : "/patient/dashboard")}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
            >
              Back to dashboard
            </button>
          </div>
        </div>
      </div>
  );
}