"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/app/dashboard/layout";
import { saveResult, publishResult, getAllResults } from "../api/labApi";
import { ResultParameter, LabResult } from "../types";
import { patientService, PatientOption } from "@/services/prescriptionService";
import { Plus, Copy, Check, UserRound } from "lucide-react";

const DRAFT_KEY = "lab_result_draft";

const emptyForm = {
    testOrderId: "", sampleId: "", patientId: "", verifiedBy: "", isCritical: false,
};
const emptyParams: ResultParameter[] = [
    { parameterName: "", value: "", unit: "", referenceRange: "", outOfRange: false },
];

export default function ResultsPage() {
    const [form, setForm] = useState(emptyForm);
    const [parameters, setParameters] = useState<ResultParameter[]>(emptyParams);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [savedResultId, setSavedResultId] = useState("");
    const [results, setResults] = useState<LabResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const [patients, setPatients] = useState<PatientOption[]>([]);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [selectedPatientName, setSelectedPatientName] = useState("");

    const inputClass = "border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500";

    // Restore draft on mount
    useEffect(() => {
        const saved = sessionStorage.getItem(DRAFT_KEY);
        if (saved) {
            try {
                const draft = JSON.parse(saved);
                if (draft.form) setForm(draft.form);
                if (draft.parameters) setParameters(draft.parameters);
            } catch {
                // ignore corrupt draft
            }
        }
    }, []);

    // Save draft whenever form/parameters change
    useEffect(() => {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ form, parameters }));
    }, [form, parameters]);

    // Restore selected patient name once both draft and patient list are ready
    useEffect(() => {
        if (form.patientId && patients.length > 0) {
            const match = patients.find((p) => p.value === form.patientId);
            if (match) setSelectedPatientName(match.label);
        }
    }, [form.patientId, patients]);

    const loadResults = async () => {
        setLoading(true);
        try {
            setResults(await getAllResults());
        } catch (e) {
            setMessage(e instanceof Error ? e.message : "Failed to load results");
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    const loadPatients = async () => {
        setLoadingPatients(true);
        try {
            const p = await patientService.getAllPatients();
            setPatients(p);
        } catch (e) {
            console.error("Failed to load patients", e);
        } finally {
            setLoadingPatients(false);
        }
    };

    useEffect(() => {
        loadResults();
        loadPatients();
    }, []);

    const updateParam = (i: number, field: keyof ResultParameter, value: string | boolean) => {
        const updated = [...parameters];
        (updated[i] as any)[field] = value;
        setParameters(updated);
    };

    const addParam = () =>
        setParameters([...parameters, { parameterName: "", value: "", unit: "", referenceRange: "", outOfRange: false }]);

    const clearDraft = () => {
        sessionStorage.removeItem(DRAFT_KEY);
        setForm(emptyForm);
        setParameters(emptyParams);
        setSelectedPatientName("");
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.patientId) {
            setMessage("Please select a patient from the list.");
            setIsError(true);
            return;
        }
        try {
            const result = await saveResult({ ...form, parameters, status: "DRAFT" });
            setSavedResultId(result.id);
            setMessage("Result saved. You can now publish it.");
            setIsError(false);
            loadResults();
        } catch (err) {
            setMessage(err instanceof Error ? err.message : "Failed to save result");
            setIsError(true);
        }
    };

    const handlePublish = async () => {
        try {
            await publishResult(savedResultId);
            setMessage("Result published to patient.");
            setIsError(false);
            loadResults();
            clearDraft();
            setSavedResultId("");
        } catch (err) {
            setMessage(err instanceof Error ? err.message : "Failed to publish result");
            setIsError(true);
        }
    };

    const handleCopyId = (id: string) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const statusColor = (status: string) =>
        status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700" :
            status === "VERIFIED" ? "bg-blue-100 text-blue-700" :
                "bg-slate-100 text-slate-600";

    return (
        <DashboardLayout pageTitle="Enter Test Result">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Enter Test Result</h2>
                <button onClick={clearDraft} className="text-xs text-slate-400 hover:text-red-500">
                    Clear form
                </button>
            </div>

            <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-6 max-w-3xl space-y-4 shadow-sm">
                <div className="grid grid-cols-3 gap-3">
                    <input placeholder="Test Order ID" value={form.testOrderId} required
                           onChange={(e) => setForm({ ...form, testOrderId: e.target.value })} className={inputClass} />
                    <input placeholder="Sample ID" value={form.sampleId} required
                           onChange={(e) => setForm({ ...form, sampleId: e.target.value })} className={inputClass} />

                    <div>
                        <select
                            value={form.patientId}
                            required
                            disabled={loadingPatients}
                            onChange={(e) => {
                                const selected = patients.find((p) => p.value === e.target.value);
                                setForm({ ...form, patientId: e.target.value });
                                setSelectedPatientName(selected?.label || "");
                            }}
                            className={`${inputClass} w-full`}
                        >
                            <option value="">-- Select Patient --</option>
                            {patients.map((p) => (
                                <option key={p.value} value={p.value}>
                                    {p.label} ({p.value})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {selectedPatientName && (
                    <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/50 p-2.5 -mt-2">
                        <UserRound size={16} className="text-blue-600" />
                        <span className="text-sm font-medium text-slate-800">{selectedPatientName}</span>
                    </div>
                )}

                <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Parameters</h3>
                    <div className="space-y-2">
                        {parameters.map((p, i) => (
                            <div key={i} className="grid grid-cols-5 gap-2 items-center">
                                <input placeholder="Name" value={p.parameterName}
                                       onChange={(e) => updateParam(i, "parameterName", e.target.value)} className={inputClass} />
                                <input placeholder="Value" value={p.value}
                                       onChange={(e) => updateParam(i, "value", e.target.value)} className={inputClass} />
                                <input placeholder="Unit" value={p.unit}
                                       onChange={(e) => updateParam(i, "unit", e.target.value)} className={inputClass} />
                                <input placeholder="Reference Range" value={p.referenceRange}
                                       onChange={(e) => updateParam(i, "referenceRange", e.target.value)} className={inputClass} />
                                <label className="flex items-center gap-1 text-xs text-slate-500">
                                    <input type="checkbox" checked={p.outOfRange}
                                           onChange={(e) => updateParam(i, "outOfRange", e.target.checked)} />
                                    Out of range
                                </label>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addParam} className="flex items-center gap-1 text-blue-600 text-sm mt-2">
                        <Plus size={14} /> Add parameter
                    </button>
                </div>

                <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" checked={form.isCritical}
                           onChange={(e) => setForm({ ...form, isCritical: e.target.checked })} />
                    Mark as critical result 🚨
                </label>

                <input placeholder="Verified By (Lab Officer ID)" value={form.verifiedBy} required
                       onChange={(e) => setForm({ ...form, verifiedBy: e.target.value })} className={`${inputClass} w-full`} />

                <div className="flex gap-2">
                    <button type="submit" disabled={loadingPatients}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg text-sm">
                        Save Result
                    </button>
                    {savedResultId && (
                        <button type="button" onClick={handlePublish}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-lg text-sm">
                            Publish Result
                        </button>
                    )}
                </div>
                {message && <p className={`text-sm ${isError ? "text-red-600" : "text-emerald-600"}`}>{message}</p>}
            </form>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-slate-100 text-slate-500 text-left bg-slate-50">
                        <th className="px-6 py-3 font-medium">Result ID</th>
                        <th className="px-6 py-3 font-medium">Patient</th>
                        <th className="px-6 py-3 font-medium">Critical</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 font-medium">Resulted At</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {results.map((r) => (
                        <tr key={r.id} className={r.critical ? "bg-red-50/50" : ""}>
                            <td className="px-6 py-3">
                                <button onClick={() => handleCopyId(r.id)}
                                        className="flex items-center gap-1.5 font-mono text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md text-slate-600 whitespace-nowrap">
                                    {copiedId === r.id ? (<><Check size={12} className="text-emerald-600" /> Copied!</>) : (<><Copy size={12} /> {r.id}</>)}
                                </button>
                            </td>
                            <td className="px-6 py-3">
                                {patients.find((p) => p.value === r.patientId)?.label || r.patientId}
                            </td>
                            <td className="px-6 py-3">
                                {r.critical ? (
                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">CRITICAL</span>
                                ) : (
                                    <span className="text-xs text-slate-400">—</span>
                                )}
                            </td>
                            <td className="px-6 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(r.status)}`}>{r.status}</span>
                            </td>
                            <td className="px-6 py-3 text-slate-500">{new Date(r.resultedAt).toLocaleString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {!loading && results.length === 0 && (
                    <p className="p-6 text-center text-slate-400 text-sm">No results found.</p>
                )}
            </div>
        </DashboardLayout>
    );
}