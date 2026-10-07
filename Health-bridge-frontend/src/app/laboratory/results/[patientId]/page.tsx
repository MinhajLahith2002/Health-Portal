"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "@/app/dashboard/layout";
import { getPatientHistory } from "../../api/labApi";
import { LabResult } from "../../types";

export default function PatientHistoryPage() {
    const params = useParams<{ patientId: string }>();
    const patientId = params.patientId;

    const [history, setHistory] = useState<LabResult[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!patientId) return;
        getPatientHistory(patientId)
            .then(setHistory)
            .catch((e) => setError(e instanceof Error ? e.message : "Failed to load history"))
            .finally(() => setLoading(false));
    }, [patientId]);

    return (
        <DashboardLayout pageTitle={`Result History — ${patientId}`}>
            <h2 className="text-lg font-semibold text-slate-900">Result History — {patientId}</h2>
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="space-y-3">
                {history.map((r) => (
                    <div key={r.id} className={`bg-white border rounded-xl p-4 shadow-sm ${r.critical ? "border-red-300" : "border-slate-200"}`}>
                        <div className="flex justify-between mb-2">
                            <p className="font-medium text-sm text-slate-800">{new Date(r.resultedAt).toLocaleString()}</p>
                            <div className="flex gap-2">
                                {r.critical && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">CRITICAL</span>}
                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium">{r.status}</span>
                            </div>
                        </div>
                        {r.parameters.map((p, i) => (
                            <p key={i} className="text-sm text-slate-600">
                                {p.parameterName}: <span className="font-medium text-slate-900">{p.value} {p.unit}</span>{" "}
                                <span className="text-slate-400">({p.referenceRange})</span>{" "}
                                {p.outOfRange && <span className="text-red-600 font-medium">Out of range</span>}
                            </p>
                        ))}
                    </div>
                ))}
            </div>

            {!loading && history.length === 0 && !error && (
                <p className="text-slate-400 text-sm">No results found for this patient.</p>
            )}
        </DashboardLayout>
    );
}