// src/app/pharmacy/medicines/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";
import { Sidebar } from "@/components/ui/Sidebar";
import { getAllMedicines } from "@/services/pharmacyService";
import type { Medicine } from "@/types/pharmacy";

export default function MedicinesListPage() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadMedicines = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAllMedicines();
            setMedicines(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load medicines");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let cancelled = false;

        async function init() {
            try {
                const data = await getAllMedicines();
                if (!cancelled) setMedicines(Array.isArray(data) ? data : []);
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load medicines");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void init();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* 1. Main UI Sidebar Component */}
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Medicines Catalog</h1>
                            <p className="text-xs text-slate-500 mt-0.5">
                                View, register, and update pharmaceutical items and pricing.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => void loadMedicines()}
                                disabled={loading}
                                className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm disabled:opacity-50 transition"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
                            </button>
                            <Link
                                href="/pharmacy/medicines/new"
                                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 shadow-sm transition"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add Medicine
                            </Link>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 shadow-sm">
                            {error}
                        </div>
                    )}

                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200/80">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-600">
                                <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th className="px-5 py-4 font-semibold">Name</th>
                                    <th className="px-5 py-4 font-semibold">Code</th>
                                    <th className="px-5 py-4 font-semibold">Category</th>
                                    <th className="px-5 py-4 font-semibold">Unit Price</th>
                                    <th className="px-5 py-4 font-semibold text-right">Action</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                                            <div className="flex items-center justify-center gap-2">
                                                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                                                Loading medicines…
                                            </div>
                                        </td>
                                    </tr>
                                ) : medicines.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                                            No medicines registered yet.
                                        </td>
                                    </tr>
                                ) : (
                                    medicines.map((m) => (
                                        <tr key={m.id} className="hover:bg-slate-50/60 transition">
                                            <td className="px-5 py-4 font-semibold text-slate-900">{m.name}</td>
                                            <td className="px-5 py-4 font-mono text-slate-600">{m.medicineCode}</td>
                                            <td className="px-5 py-4 text-slate-600">{m.category ?? "—"}</td>
                                            <td className="px-5 py-4 font-medium text-slate-800">
                                                LKR {m.unitPrice?.toFixed(2)}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <Link
                                                    href={`/pharmacy/medicines/${m.id}`}
                                                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                                                >
                                                    Edit
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}