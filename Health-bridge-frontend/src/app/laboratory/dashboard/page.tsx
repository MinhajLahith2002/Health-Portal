"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/app/dashboard/layout";
import { getAllTestOrders } from "../api/labApi";
import { LabTest } from "../types";
import { ClipboardList, TestTube2, Microscope, CheckCircle2 } from "lucide-react";

export default function LabDashboardPage() {
    const [orders, setOrders] = useState<LabTest[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllTestOrders()
            .then(setOrders)
            .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
            .finally(() => setLoading(false));
    }, []);

    const counts = {
        requested: orders.filter((o) => o.status === "REQUESTED").length,
        sampleCollected: orders.filter((o) => o.status === "SAMPLE_COLLECTED").length,
        processing: orders.filter((o) => o.status === "PROCESSING").length,
        completed: orders.filter((o) => o.status === "COMPLETED").length,
    };

    const stats = [
        { label: "Requested", value: counts.requested, icon: ClipboardList, color: "bg-amber-500" },
        { label: "Sample Collected", value: counts.sampleCollected, icon: TestTube2, color: "bg-blue-500" },
        { label: "Processing", value: counts.processing, icon: Microscope, color: "bg-purple-500" },
        { label: "Completed", value: counts.completed, icon: CheckCircle2, color: "bg-emerald-500" },
    ];

    return (
        <DashboardLayout pageTitle="Laboratory Dashboard">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
                <h1 className="text-2xl font-bold">Welcome back, Lab Officer! 🧪</h1>
                <p className="mt-1 text-emerald-100">
                    {loading ? "Loading today's overview..." : `You have ${counts.requested} pending test order(s) today.`}
                </p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm">
                    Could not connect to backend: {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map((s) => (
                    <div key={s.label} className="bg-white rounded-xl shadow-sm p-5 border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{s.label}</p>
                                <p className="text-xl font-bold text-slate-900 mt-1">{loading ? "—" : s.value}</p>
                            </div>
                            <div className={`${s.color} p-2.5 rounded-lg text-white`}>
                                <s.icon className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Test Orders</h2>
                <div className="divide-y divide-slate-100">
                    {orders.slice(0, 8).map((o) => (
                        <div key={o.id} className="flex items-center justify-between py-3 text-sm">
                            <div>
                                <p className="font-medium text-slate-800">{o.patientId}</p>
                                <p className="text-slate-500 text-xs">{o.requestedTests.join(", ")}</p>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                {o.status}
              </span>
                        </div>
                    ))}
                    {orders.length === 0 && !loading && !error && (
                        <p className="text-center text-slate-400 text-sm py-8">No test orders yet.</p>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}