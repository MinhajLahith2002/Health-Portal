"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/app/dashboard/layout";
import { getTestOrdersByStatus } from "../api/labApi";
import { LabTest } from "../types";

export default function ProcessingPage() {
    const [orders, setOrders] = useState<LabTest[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTestOrdersByStatus("SAMPLE_COLLECTED")
            .then(setOrders)
            .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
            .finally(() => setLoading(false));
    }, []);

    return (
        <DashboardLayout pageTitle="Processing Queue">
            <h2 className="text-lg font-semibold text-slate-900">Processing Queue</h2>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
                {orders.map((o) => (
                    <div key={o.id} className="px-6 py-3 flex justify-between items-center text-sm">
                        <div>
                            <p className="font-medium text-slate-800">{o.patientId}</p>
                            <p className="text-slate-500 text-xs">{o.requestedTests.join(", ")}</p>
                        </div>
                        <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              Awaiting processing
            </span>
                    </div>
                ))}
                {!loading && orders.length === 0 && !error && (
                    <p className="p-6 text-center text-slate-400 text-sm">No samples waiting for processing.</p>
                )}
            </div>
        </DashboardLayout>
    );
}