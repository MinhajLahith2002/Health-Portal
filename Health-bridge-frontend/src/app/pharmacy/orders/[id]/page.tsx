// src/app/pharmacy/orders/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/ui/Sidebar";
import { getDeliveryById, updateDeliveryStatus } from "@/services/pharmacyService";

type ExtendedDeliveryDetails = {
    id: string;
    orderCode?: string;
    deliveryCode?: string;
    patientId?: string;
    deliveryAddress?: string;
    address?: string;
    fulfillmentType?: string;
    courierService?: string;
    assignedRiderName?: string;
    actionRequired?: boolean;
    status: string;
    items?: Array<{
        medicineName?: string;
        quantity?: number;
        [key: string]: unknown;
    }>;
    [key: string]: unknown;
};

export default function OrderDetailPage() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const params = useParams();
    const rawId = params?.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const router = useRouter();

    const [order, setOrder] = useState<ExtendedDeliveryDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            if (!id) return;
            try {
                setLoading(true);
                const data = await getDeliveryById(id);
                const unwrapped = (data as unknown as { data?: ExtendedDeliveryDetails })?.data || (data as unknown as ExtendedDeliveryDetails);
                if (!cancelled) setOrder(unwrapped);
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load delivery details");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void load();
        return () => {
            cancelled = true;
        };
    }, [id]);

    async function handleStatusChange(newStatus: string) {
        if (!order) return;
        try {
            setUpdating(true);
            const updated = await updateDeliveryStatus(order.id, newStatus);
            const unwrapped = (updated as unknown as { data?: ExtendedDeliveryDetails })?.data || (updated as unknown as ExtendedDeliveryDetails);
            setOrder(unwrapped);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to update delivery status");
        } finally {
            setUpdating(false);
        }
    }

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
                    {loading ? (
                        <div className="p-6 text-sm text-slate-400 flex items-center gap-2">
                            <span className="h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                            Loading delivery order…
                        </div>
                    ) : error || !order ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            Failed to load order: {error ?? "Not found"}
                        </div>
                    ) : (
                        <>
                            <div className="flex items-start justify-between">
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => router.back()}
                                        className="mb-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                                    >
                                        ← Back to deliveries
                                    </button>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-xl font-bold text-slate-900">
                                            Delivery #{order.deliveryCode || order.orderCode || order.id.slice(0, 6)}
                                        </h1>
                                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200/50">
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-0.5">Tracking ID: {order.id}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 shadow-sm cursor-pointer"
                                >
                                    Print Shipping Label
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                <div className="space-y-6 lg:col-span-2">
                                    {/* Dispatch & Shipping Info */}
                                    <section className="rounded-xl bg-white p-5 shadow-sm border border-slate-200/80">
                                        <h2 className="mb-4 text-sm font-semibold text-slate-900 flex items-center gap-2">
                                            🚚 Dispatch & Shipping Info
                                        </h2>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                                            <div>
                                                <p className="text-slate-400">Recipient / Delivery Address</p>
                                                <p className="font-medium text-slate-800 mt-1">
                                                    {order.deliveryAddress || order.address || "No delivery address provided"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Fulfillment Method</p>
                                                <p className="font-medium text-slate-800 mt-1">
                                                    {order.fulfillmentType || "Doorstep Delivery"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Assigned Courier / Service</p>
                                                <p className="font-medium text-slate-800 mt-1">
                                                    {order.courierService || "Internal Pharmacy Fleet"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Assigned Delivery Rider</p>
                                                <p className="font-medium text-slate-800 mt-1">
                                                    {order.assignedRiderName || "Awaiting Rider Assignment"}
                                                </p>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Package Contents */}
                                    <section className="rounded-xl bg-white p-5 shadow-sm border border-slate-200/80">
                                        <h2 className="mb-3 text-sm font-semibold text-slate-900">📦 Package Contents</h2>
                                        {!order.items || order.items.length === 0 ? (
                                            <p className="text-xs text-slate-400 py-3">No packed items found.</p>
                                        ) : (
                                            <ul className="divide-y divide-slate-100">
                                                {order.items.map((item, idx) => (
                                                    <li key={idx} className="flex items-center justify-between py-2.5">
                                                        <div>
                                                            <p className="text-xs font-medium text-slate-900">
                                                                {item.medicineName || "Prescription Item"}
                                                            </p>
                                                            <p className="text-[11px] text-slate-400">
                                                                Qty: {item.quantity || 1}
                                                            </p>
                                                        </div>
                                                        <span className="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-[10px] font-medium border border-emerald-200/50">
                                                            Packed & Verified
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </section>
                                </div>

                                {/* Live Delivery Status Stepper */}
                                <div className="space-y-4">
                                    <section className="rounded-xl bg-white p-5 shadow-sm border border-slate-200/80">
                                        <h2 className="mb-3 text-sm font-semibold text-slate-900">Update Delivery Stage</h2>
                                        <div className="space-y-2">
                                            {[
                                                { key: "PROCESSING", label: "Package in Preparation" },
                                                { key: "DISPATCHED", label: "Handed over to Rider" },
                                                { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
                                                { key: "DELIVERED", label: "Successfully Delivered" },
                                                { key: "CANCELLED", label: "Cancel Delivery" },
                                            ].map((step) => (
                                                <button
                                                    key={step.key}
                                                    type="button"
                                                    disabled={updating || order.status === step.key}
                                                    onClick={() => void handleStatusChange(step.key)}
                                                    className={`w-full rounded-lg border px-3 py-2 text-left text-xs font-medium transition cursor-pointer ${
                                                        order.status === step.key
                                                            ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                                                            : "border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                                    }`}
                                                >
                                                    {step.label}
                                                </button>
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}