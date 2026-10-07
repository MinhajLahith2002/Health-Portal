// src/app/pharmacy/orders/page.tsx
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { Search, RefreshCw, Eye, PackageCheck } from "lucide-react";
import { Sidebar } from "@/components/ui/Sidebar";
import { usePharmacyId } from "@/hooks/usePharmacyId";
import { getDeliveriesByPharmacy } from "@/services/pharmacyService";
import type { Delivery } from "@/types/pharmacy";

const STATUS_STYLES: Record<string, string> = {
    PENDING: "bg-slate-100 text-slate-600 border border-slate-200/60",
    PROCESSING: "bg-amber-50 text-amber-700 border border-amber-200/50",
    DISPATCHED: "bg-blue-50 text-blue-700 border border-blue-200/50",
    OUT_FOR_DELIVERY: "bg-indigo-50 text-indigo-700 border border-indigo-200/50",
    DELIVERED: "bg-emerald-50 text-emerald-700 border border-emerald-200/50",
    CANCELLED: "bg-rose-50 text-rose-700 border border-rose-200/50",
    FAILED: "bg-rose-50 text-rose-700 border border-rose-200/50",
};

type TabFilter = "ALL" | "PENDING_VERIFICATION" | "IN_PREPARATION";

export default function OrdersOverviewPage() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const { pharmacyId, loading: pharmacyLoading } = usePharmacyId();
    const [orders, setOrders] = useState<Delivery[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState<TabFilter>("ALL");

    useEffect(() => {
        let isMounted = true;

        async function fetchOrders() {
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
                    : ((res as unknown as { data?: Delivery[] })?.data || []);
                setOrders(data);
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : "Failed to load orders list");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        if (!pharmacyLoading) {
            void fetchOrders();
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
                : ((res as unknown as { data?: Delivery[] })?.data || []);
            setOrders(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to refresh orders");
        } finally {
            setLoading(false);
        }
    }, [pharmacyId]);

    const filtered = useMemo(() => {
        return orders.filter((o) => {
            const orderCodeStr = o.orderCode || o.id || "";
            const patientIdStr = o.patientId || "";

            const matchesSearch =
                !search ||
                orderCodeStr.toLowerCase().includes(search.toLowerCase()) ||
                patientIdStr.toLowerCase().includes(search.toLowerCase());

            const matchesTab =
                tab === "ALL" ||
                (tab === "PENDING_VERIFICATION" && (o.status === "PENDING" || (o.status as string) === "Pending Verification")) ||
                (tab === "IN_PREPARATION" && (o.status === "PROCESSING" || (o.status as string) === "In Preparation"));

            return matchesSearch && matchesTab;
        });
    }, [orders, search, tab]);

    const counts = useMemo(() => {
        const totalToday = orders.length;
        const actionRequired = orders.filter((o) => {
            const isActionReq = (o as unknown as { actionRequired?: boolean }).actionRequired;
            return isActionReq || o.status === "PENDING" || (o.status as string) === "Pending Verification";
        }).length;

        return { totalToday, actionRequired };
    }, [orders]);

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
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Orders Overview</h1>
                            <p className="text-xs text-slate-500 mt-0.5">Manage and track daily prescription fulfillments.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => void handleRefresh()}
                            disabled={loading || !pharmacyId}
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

                    {/* KPI Stats */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-xl">
                        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80">
                            <p className="text-xs font-medium text-slate-500">Total Orders Today</p>
                            <p className="text-3xl font-bold text-slate-900 mt-2">{loading ? "…" : counts.totalToday}</p>
                        </div>
                        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80">
                            <p className="text-xs font-medium text-slate-500">Action Required</p>
                            <p className={`text-3xl font-bold mt-2 ${counts.actionRequired > 0 ? "text-amber-600" : "text-slate-400"}`}>
                                {loading ? "…" : counts.actionRequired}
                            </p>
                        </div>
                    </div>

                    {/* Filter Tabs & Search */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1.5 text-xs w-full sm:w-auto">
                            {[
                                { key: "ALL", label: "All Orders" },
                                { key: "PENDING_VERIFICATION", label: "Pending Verification" },
                                { key: "IN_PREPARATION", label: "In Preparation" },
                            ].map((t) => (
                                <button
                                    key={t.key}
                                    type="button"
                                    onClick={() => setTab(t.key as TabFilter)}
                                    className={`rounded-lg px-3.5 py-2 font-medium transition-all cursor-pointer ${
                                        tab === t.key
                                            ? "bg-white text-slate-900 shadow-sm font-semibold"
                                            : "text-slate-500 hover:text-slate-800"
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* Search Input Box */}
                        <div className="relative w-full sm:w-80">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search Order ID or Patient ID..."
                                className="w-full pl-10 pr-9 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                                    title="Clear search"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200/80">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-600">
                                <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th className="px-5 py-4 font-semibold">Order ID</th>
                                    <th className="px-5 py-4 font-semibold">Patient ID</th>
                                    <th className="px-5 py-4 font-semibold">Fulfillment</th>
                                    <th className="px-5 py-4 font-semibold text-center">Status</th>
                                    <th className="px-5 py-4 font-semibold text-right">Action</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                                            <div className="flex items-center justify-center gap-2">
                                                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                                                Loading orders data…
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                                            No orders found.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50/60 transition">
                                            <td className="px-5 py-4 font-mono font-medium text-slate-900">
                                                #{order.orderCode || order.id?.slice(0, 8)}
                                            </td>
                                            <td className="px-5 py-4 font-mono text-slate-600">{order.patientId || "—"}</td>
                                            <td className="px-5 py-4 text-slate-600">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                                                    {order.fulfillmentType ?? "Standard Delivery"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                                                        STATUS_STYLES[order.status] ?? "bg-slate-100 text-slate-500"
                                                    }`}
                                                >
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/pharmacy/orders/${order.id}`}
                                                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="View Order Details"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </Link>
                                                    {(order.status === "PENDING" || (order.status as string) === "Pending Verification") && (
                                                        <Link
                                                            href={`/pharmacy/orders/${order.id}`}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white text-[11px] font-medium rounded-lg hover:bg-blue-700 shadow-sm transition"
                                                        >
                                                            <PackageCheck className="w-3 h-3" /> Process
                                                        </Link>
                                                    )}
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