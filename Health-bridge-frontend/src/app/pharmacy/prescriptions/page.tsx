// src/app/pharmacy/prescriptions/page.tsx
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Search, RefreshCw, Eye, User } from "lucide-react";
import { Sidebar } from "@/components/ui/Sidebar";
import { prescriptionService, patientService } from "@/services/prescriptionService";
import type { Prescription } from "@/types/prescription";

interface ExtendedPrescriptionItem {
    id?: string;
    code?: string;
    prescriptionCode?: string;
    patientId?: string;
    patientName?: string;
    patient?: { id?: string; fullName?: string; name?: string };
    doctorName?: string;
    doctor?: { fullName?: string; name?: string };
    prescribedBy?: string;
    date?: string;
    createdAt?: string;
    prescriptionDate?: string;
    status?: string;
    medicines?: unknown[];
    items?: unknown[];
    medications?: unknown[];
    instructions?: string;
    notes?: string;
    [key: string]: unknown;
}

interface FormattedPrescription {
    id: string;
    prescriptionCode: string;
    patientId: string;
    patientName: string;
    doctorName: string;
    date: string;
    status: string;
    medicinesCount: number;
    instructions: string;
}

type TabType = "ALL" | "ACTIVE" | "DISPENSED" | "CANCELLED";

export default function PharmacyPrescriptionQueuePage() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const [prescriptions, setPrescriptions] = useState<FormattedPrescription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [currentTab, setCurrentTab] = useState<TabType>("ALL");
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [selectedRx, setSelectedRx] = useState<FormattedPrescription | null>(null);

    const fetchPrescriptionData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [rxRes, patientsList] = await Promise.all([
                prescriptionService.getAllPrescriptions().catch(() => [] as Prescription[]),
                patientService.getAllPatients().catch(() => []),
            ]);

            const rawList: ExtendedPrescriptionItem[] = Array.isArray(rxRes)
                ? (rxRes as unknown as ExtendedPrescriptionItem[])
                : ((rxRes as unknown as { data?: ExtendedPrescriptionItem[]; content?: ExtendedPrescriptionItem[] })?.data ||
                    (rxRes as unknown as { content?: ExtendedPrescriptionItem[] })?.content ||
                    []);

            const patientMap = new Map<string, string>();
            if (Array.isArray(patientsList)) {
                patientsList.forEach((p) => {
                    if (p.value) patientMap.set(p.value, p.label);
                });
            }

            const formatted: FormattedPrescription[] = rawList.map((rx, idx) => {
                const pId = rx.patientId || rx.patient?.id || `PAT-${idx + 1}`;
                const pName =
                    rx.patientName ||
                    rx.patient?.fullName ||
                    rx.patient?.name ||
                    patientMap.get(pId) ||
                    `Patient (${pId.slice(0, 6)})`;

                const dName =
                    rx.doctorName ||
                    rx.doctor?.fullName ||
                    rx.doctor?.name ||
                    rx.prescribedBy ||
                    "Dr. Assigned";

                const rawDate = rx.date || rx.createdAt || rx.prescriptionDate;
                const dateDisplay = rawDate
                    ? new Date(rawDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    })
                    : "Today";

                const medsList = rx.medicines || rx.items || rx.medications || [];

                return {
                    id: rx.id || `rx-${idx}`,
                    prescriptionCode: rx.prescriptionCode || rx.code || rx.id?.slice(0, 8)?.toUpperCase() || `RX-${idx + 100}`,
                    patientId: pId,
                    patientName: pName,
                    doctorName: dName,
                    date: dateDisplay,
                    status: (rx.status || "ACTIVE").toUpperCase(),
                    medicinesCount: Array.isArray(medsList) ? medsList.length : 1,
                    instructions: rx.instructions || rx.notes || "No special instructions",
                };
            });

            setPrescriptions(formatted);
        } catch (err) {
            console.error("Prescriptions fetch error:", err);
            setError(err instanceof Error ? err.message : "Failed to load prescriptions from system");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        async function initialize() {
            if (isMounted) {
                await fetchPrescriptionData();
            }
        }

        void initialize();

        return () => {
            isMounted = false;
        };
    }, [fetchPrescriptionData]);

    const handleDispense = async (id: string) => {
        try {
            setUpdatingId(id);
            await prescriptionService.updatePrescription(
                id,
                { status: "DISPENSED" } as unknown as Parameters<typeof prescriptionService.updatePrescription>[1]
            );
            await fetchPrescriptionData();
            alert("Prescription marked as DISPENSED successfully!");
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to update prescription status");
        } finally {
            setUpdatingId(null);
        }
    };

    const counts = useMemo(() => {
        const active = prescriptions.filter(
            (p) => p.status === "ACTIVE" || p.status === "PENDING" || p.status === "ISSUED"
        ).length;

        const dispensed = prescriptions.filter(
            (p) => p.status === "DISPENSED" || p.status === "COMPLETED"
        ).length;

        const cancelled = prescriptions.filter((p) => p.status === "CANCELLED").length;

        return { active, dispensed, cancelled };
    }, [prescriptions]);

    const filteredPrescriptions = useMemo(() => {
        const q = search.toLowerCase();

        return prescriptions.filter((item) => {
            const matchesSearch =
                !q ||
                item.patientName.toLowerCase().includes(q) ||
                item.doctorName.toLowerCase().includes(q) ||
                item.prescriptionCode.toLowerCase().includes(q) ||
                item.patientId.toLowerCase().includes(q);

            const s = item.status;
            const matchesTab =
                currentTab === "ALL" ||
                (currentTab === "ACTIVE" && (s === "ACTIVE" || s === "PENDING" || s === "ISSUED")) ||
                (currentTab === "DISPENSED" && (s === "DISPENSED" || s === "COMPLETED")) ||
                (currentTab === "CANCELLED" && s === "CANCELLED");

            return matchesSearch && matchesTab;
        });
    }, [prescriptions, search, currentTab]);

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* 1. Main UI Sidebar */}
            <Sidebar
                userRole="PHARMACIST"
                userName="Pharmacist"
                collapsed={collapsed}
                onToggleCollapse={() => setCollapsed(!collapsed)}
                mobileOpen={mobileOpen}
                onCloseMobile={() => setMobileOpen(false)}
            />

            {/* 2. Main Page Content View */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                <main className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Prescription queue</h1>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Review, verify, and dispense doctor prescriptions.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => void fetchPrescriptionData()}
                            disabled={loading}
                            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm disabled:opacity-50 transition self-start sm:self-auto cursor-pointer"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
                        </button>
                    </div>

                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 shadow-sm">
                            {error}
                        </div>
                    )}

                    {/* 3 Status Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                <span className="text-xs font-semibold text-slate-600">Active</span>
                            </div>
                            <div className="mt-3 text-3xl font-bold text-slate-900">{loading ? "…" : counts.active}</div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                <span className="text-xs font-semibold text-slate-600">Dispensed</span>
                            </div>
                            <div className="mt-3 text-3xl font-bold text-slate-900">{loading ? "…" : counts.dispensed}</div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                <span className="text-xs font-semibold text-slate-600">Cancelled</span>
                            </div>
                            <div className="mt-3 text-3xl font-bold text-slate-900">{loading ? "…" : counts.cancelled}</div>
                        </div>
                    </div>

                    {/* Tabs and Search Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1.5 text-xs w-full sm:w-auto">
                            {(["ALL", "ACTIVE", "DISPENSED", "CANCELLED"] as TabType[]).map((tabKey) => (
                                <button
                                    key={tabKey}
                                    type="button"
                                    onClick={() => setCurrentTab(tabKey)}
                                    className={`rounded-lg px-4 py-2 font-medium capitalize transition-all cursor-pointer ${
                                        currentTab === tabKey
                                            ? "bg-white text-slate-900 shadow-sm font-semibold"
                                            : "text-slate-500 hover:text-slate-800"
                                    }`}
                                >
                                    {tabKey.toLowerCase()}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full sm:w-80">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search patient, Rx ID, doctor..."
                                className="w-full pl-10 pr-9 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Queue Table */}
                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200/80">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-600">
                                <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th className="px-5 py-4 font-semibold">PATIENT</th>
                                    <th className="px-5 py-4 font-semibold">RX ID</th>
                                    <th className="px-5 py-4 font-semibold">PRESCRIBED BY</th>
                                    <th className="px-5 py-4 font-semibold">DATE</th>
                                    <th className="px-5 py-4 font-semibold text-center">STATUS</th>
                                    <th className="px-5 py-4 font-semibold text-right">ACTION</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                                            <div className="flex items-center justify-center gap-2">
                                                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                                                Loading doctor prescriptions queue…
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredPrescriptions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                                            No prescriptions found. Once a doctor submits a prescription, it will appear here.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPrescriptions.map((rx) => {
                                        const isDispensed = rx.status === "DISPENSED" || rx.status === "COMPLETED";

                                        return (
                                            <tr key={rx.id} className="hover:bg-slate-50/60 transition">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="p-1.5 rounded-full bg-blue-50 text-blue-600">
                                                            <User className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">{rx.patientName}</p>
                                                            <span className="text-[10px] text-slate-400 font-mono">
                                                                ID: {rx.patientId}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 font-mono font-medium text-slate-800">
                                                    #{rx.prescriptionCode}
                                                </td>
                                                <td className="px-5 py-4 text-slate-700 font-medium">{rx.doctorName}</td>
                                                <td className="px-5 py-4 text-slate-500">{rx.date}</td>
                                                <td className="px-5 py-4 text-center">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                                                            isDispensed
                                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                                                                : rx.status === "CANCELLED"
                                                                    ? "bg-rose-50 text-rose-700 border border-rose-200/50"
                                                                    : "bg-amber-50 text-amber-700 border border-amber-200/50"
                                                        }`}
                                                    >
                                                        {rx.status}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {!isDispensed && (
                                                            <button
                                                                type="button"
                                                                disabled={updatingId === rx.id}
                                                                onClick={() => void handleDispense(rx.id)}
                                                                className="px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-[11px] font-semibold transition shadow-sm disabled:opacity-50 cursor-pointer"
                                                            >
                                                                {updatingId === rx.id ? "Dispensing..." : "Dispense"}
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedRx(rx)}
                                                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                                                            title="Quick View"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Detail Modal */}
                    {selectedRx && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <h2 className="text-sm font-bold text-slate-900">
                                        Prescription #{selectedRx.prescriptionCode}
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRx(null)}
                                        className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="text-xs space-y-2">
                                    <p><span className="text-slate-400">Patient:</span> <strong className="text-slate-800">{selectedRx.patientName}</strong></p>
                                    <p><span className="text-slate-400">Doctor:</span> <strong className="text-slate-800">{selectedRx.doctorName}</strong></p>
                                    <p><span className="text-slate-400">Date:</span> <strong className="text-slate-800">{selectedRx.date}</strong></p>
                                    <p><span className="text-slate-400">Status:</span> <strong className="text-blue-600">{selectedRx.status}</strong></p>
                                    <p><span className="text-slate-400">Instructions:</span> {selectedRx.instructions}</p>
                                </div>

                                <div className="border-t border-slate-100 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRx(null)}
                                        className="w-full py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200 transition cursor-pointer"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}