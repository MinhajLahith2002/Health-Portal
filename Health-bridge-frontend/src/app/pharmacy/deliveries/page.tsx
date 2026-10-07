// src/app/pharmacy/deliveries/page.tsx
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { Search, RefreshCw, Truck, MapPin, CheckCircle2, Clock, Eye } from "lucide-react";
import { Sidebar } from "@/components/ui/Sidebar"; // ඔබගේ Sidebar component එක පිහිටි path එක
import { usePharmacyId } from "@/hooks/usePharmacyId";
import { getDeliveriesByPharmacy, updateDeliveryStatus } from "@/services/pharmacyService";

type ExtendedDelivery = {
    id: string;
    orderCode?: string;
    deliveryCode?: string;
    patientId?: string;
    recipientName?: string;
    deliveryAddress?: string;
    address?: string;
    fulfillmentType?: string;
    courierService?: string;
    assignedRiderName?: string;
    status: string;
    createdAt?: string;
    createdDate?: string;
    items?: Array<{
        medicineName?: string;
        quantity?: number;
        [key: string]: unknown;
    }>;
    [key: string]: unknown;
};

const STATUS_STYLES: Record<string, string> = {
    DISPATCHED: "bg-blue-50 text-blue-700 border border-blue-200/50",
    OUT_FOR_DELIVERY: "bg-indigo-50 text-indigo-700 border border-indigo-200/50",
    DELIVERED: "bg-emerald-50 text-emerald-700 border border-emerald-200/50",
    PROCESSING: "bg-amber-50 text-amber-700 border border-amber-200/50",
    CANCELLED: "bg-rose-50 text-rose-700 border border-rose-200/50",
};

type DeliveryFilterTab = "ALL" | "OUT_FOR_DELIVERY" | "DISPATCHED" | "DELIVERED";

export default function PharmacyDeliveriesPage() {
    // Sidebar State Controls
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const { pharmacyId, loading: pharmacyLoading } = usePharmacyId();
    const [deliveries, setDeliveries] = useState<ExtendedDelivery[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState<DeliveryFilterTab>("ALL");

    useEffect(() => {
        let isMounted = true;

        async function fetchDeliveries() {
            if (!pharmacyId) {
                if (isMounted) setLoading(false);
                return;
            }

            try {
                if (isMounted) {
                    setLoading(true);
                    setError(null);
                }

                const res = await getDeliveriesByPharmacy(pharmacyId);
                if (!isMounted) return;

                const data = Array.isArray(res)
                    ? res
                    : ((res as unknown as { data?: ExtendedDelivery[] })?.data || []);
                setDeliveries(data as ExtendedDelivery[]);
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : "Failed to load deliveries");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        if (!pharmacyLoading) {
            void fetchDeliveries();
        }

        return () => {
            isMounted = false;
        };
    }, [pharmacyId, pharmacyLoading]);

    const handleRefresh = useCallback(async () => {
        if (!pharmacyId) return;

        try {
            setLoading(true);
            setError(null);
            const res = await getDeliveriesByPharmacy(pharmacyId);
            const data = Array.isArray(res)
                ? res
                : ((res as unknown as { data?: ExtendedDelivery[] })?.data || []);
            setDeliveries(data as ExtendedDelivery[]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to refresh deliveries");
        } finally {
            setLoading(false);
        }
    }, [pharmacyId]);

    const handleQuickStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await updateDeliveryStatus(id, newStatus);
            await handleRefresh();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Status update failed");
        }
    };

    const counts = useMemo(() => {
        const active = deliveries.filter((d) => d.status === "OUT_FOR_DELIVERY" || d.status === "DISPATCHED").length;
        const completed = deliveries.filter((d) => d.status === "DELIVERED").length;
        const preparing = deliveries.filter((d) => d.status === "PROCESSING" || d.status === "PENDING").length;
        return { active, completed, preparing, total: deliveries.length };
    }, [deliveries]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return deliveries.filter((d) => {
            const code = (d.orderCode || d.id || "").toLowerCase();
            const addr = (d.deliveryAddress || d.address || "").toLowerCase();
            const rider = (d.assignedRiderName || d.courierService || "").toLowerCase();
            const recipient = (d.recipientName || d.patientId || "").toLowerCase();

            const matchesSearch = !q || code.includes(q) || addr.includes(q) || rider.includes(q) || recipient.includes(q);

            const matchesTab =
                tab === "ALL" ||
                (tab === "OUT_FOR_DELIVERY" && d.status === "OUT_FOR_DELIVERY") ||
                (tab === "DISPATCHED" && d.status === "DISPATCHED") ||
                (tab === "DELIVERED" && d.status === "DELIVERED");

            return matchesSearch && matchesTab;
        });
    }, [deliveries, search, tab]);

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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Deliveries Management</h1>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Real-time rider tracking, route status, and prescription dispatch fulfillment.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => void handleRefresh()}
                            disabled={loading}
                            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm disabled:opacity-50 transition self-start sm:self-auto"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
                        </button>
                    </div>

                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 shadow-sm">
                            {error}
                        </div>
                    )}

                    {/* KPI Cards Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Out for Delivery</span>
                                <Truck className="w-4 h-4 text-indigo-500" />
                            </div>
                            <div className="text-3xl font-bold text-slate-900 mt-2">{loading ? "…" : counts.active}</div>
                            <p className="text-[10px] text-indigo-600 font-medium mt-1">Live in transit</p>
                        </div>

                        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">In Preparation</span>
                                <Clock className="w-4 h-4 text-amber-500" />
                            </div>
                            <div className="text-3xl font-bold text-slate-900 mt-2">{loading ? "…" : counts.preparing}</div>
                            <p className="text-[10px] text-amber-600 font-medium mt-1">Awaiting rider pickup</p>
                        </div>

                        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Delivered Today</span>
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div className="text-3xl font-bold text-slate-900 mt-2">{loading ? "…" : counts.completed}</div>
                            <p className="text-[10px] text-emerald-600 font-medium mt-1">Completed orders</p>
                        </div>

                        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Synced</span>
                                <MapPin className="w-4 h-4 text-slate-400" />
                            </div>
                            <div className="text-3xl font-bold text-slate-900 mt-2">{loading ? "…" : counts.total}</div>
                            <p className="text-[10px] text-slate-400 mt-1">Orders with dispatch route</p>
                        </div>
                    </div>

                    {/* Filter Tabs & Search Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1.5 text-xs w-full sm:w-auto">
                            {[
                                { key: "ALL", label: "All Deliveries" },
                                { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
                                { key: "DISPATCHED", label: "Dispatched" },
                                { key: "DELIVERED", label: "Delivered" },
                            ].map((t) => (
                                <button
                                    key={t.key}
                                    type="button"
                                    onClick={() => setTab(t.key as DeliveryFilterTab)}
                                    className={`rounded-lg px-3.5 py-2 font-medium transition-all ${
                                        tab === t.key
                                            ? "bg-white text-slate-900 shadow-sm font-semibold"
                                            : "text-slate-500 hover:text-slate-800"
                                    }`}
                                >
                                    {t.label}
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
                                placeholder="Search tracking ID, rider or address..."
                                className="w-full pl-10 pr-9 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Deliveries Table */}
                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200/80">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-600">
                                <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th className="px-5 py-4 font-semibold">Tracking / Order ID</th>
                                    <th className="px-5 py-4 font-semibold">Recipient & Address</th>
                                    <th className="px-5 py-4 font-semibold">Assigned Rider</th>
                                    <th className="px-5 py-4 font-semibold text-center">Delivery Stage</th>
                                    <th className="px-5 py-4 font-semibold text-right">Quick Action</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                                            <div className="flex items-center justify-center gap-2">
                                                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                                                Loading delivery fleet data…
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                                            No active deliveries match your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((d) => (
                                        <tr key={d.id} className="hover:bg-slate-50/60 transition">
                                            <td className="px-5 py-4 font-mono font-medium text-slate-900">
                                                #{d.orderCode || d.id.slice(0, 8).toUpperCase()}
                                                <span className="block font-sans text-[10px] text-slate-400 font-normal mt-0.5">
                            {Array.isArray(d.items) ? `${d.items.length} package items` : "1 package"}
                          </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-slate-800">{d.recipientName || d.patientId || "Patient"}</p>
                                                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                                    {d.deliveryAddress || d.address || "Doorstep Delivery"}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 text-slate-700 font-medium">
                                                {d.assignedRiderName || d.courierService || "Internal Rider Fleet"}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                          <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                                  STATUS_STYLES[d.status] ?? "bg-slate-100 text-slate-500"
                              }`}
                          >
                            {d.status}
                          </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {d.status !== "DELIVERED" && (
                                                        <button
                                                            type="button"
                                                            onClick={() => void handleQuickStatusUpdate(d.id, "DELIVERED")}
                                                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 rounded-lg text-[11px] font-medium transition"
                                                        >
                                                            Mark Delivered
                                                        </button>
                                                    )}
                                                    <Link
                                                        href={`/pharmacy/orders/${d.id}`}
                                                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                </div>
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