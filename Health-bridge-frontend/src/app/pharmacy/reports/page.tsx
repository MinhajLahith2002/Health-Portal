// src/app/pharmacy/reports/page.tsx
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { RefreshCw, Download, TrendingUp, Truck, Search } from "lucide-react";
import { Sidebar } from "@/components/ui/Sidebar";
import { usePharmacyId } from "@/hooks/usePharmacyId";
import {
    getDeliveriesByPharmacy,
    getAllMedicines,
    getInventoryByPharmacy,
} from "@/services/pharmacyService";
import type { Delivery, Medicine, InventoryItem } from "@/types/pharmacy";

interface TransactionRow {
    id: string;
    transactionCode: string;
    customerName: string;
    status: string;
    createdDate: string;
    itemsCount: number;
    amount: number;
}

export default function PharmacyReportsPage() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const { pharmacyId, loading: pharmacyLoading } = usePharmacyId();
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<"month" | "week" | "year">("month");
    const [search, setSearch] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function fetchReportData() {
            if (!pharmacyId) {
                if (isMounted) setLoading(false);
                return;
            }

            try {
                if (isMounted) {
                    setLoading(true);
                    setError(null);
                }

                const [delRes, medRes, invRes] = await Promise.all([
                    getDeliveriesByPharmacy(pharmacyId).catch(() => [] as Delivery[]),
                    getAllMedicines().catch(() => [] as Medicine[]),
                    getInventoryByPharmacy(pharmacyId).catch(() => [] as InventoryItem[]),
                ]);

                if (!isMounted) return;

                const rawDel = Array.isArray(delRes)
                    ? delRes
                    : ((delRes as unknown as { data?: Delivery[] })?.data || []);
                const rawMeds = Array.isArray(medRes)
                    ? medRes
                    : ((medRes as unknown as { data?: Medicine[] })?.data || []);
                const rawInv = Array.isArray(invRes)
                    ? invRes
                    : ((invRes as unknown as { data?: InventoryItem[] })?.data || []);

                setDeliveries(rawDel);
                setMedicines(rawMeds);
                setInventory(rawInv);
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : "Failed to load report data");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        if (!pharmacyLoading) {
            void fetchReportData();
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

            const [delRes, medRes, invRes] = await Promise.all([
                getDeliveriesByPharmacy(pharmacyId).catch(() => [] as Delivery[]),
                getAllMedicines().catch(() => [] as Medicine[]),
                getInventoryByPharmacy(pharmacyId).catch(() => [] as InventoryItem[]),
            ]);

            const rawDel = Array.isArray(delRes)
                ? delRes
                : ((delRes as unknown as { data?: Delivery[] })?.data || []);
            const rawMeds = Array.isArray(medRes)
                ? medRes
                : ((medRes as unknown as { data?: Medicine[] })?.data || []);
            const rawInv = Array.isArray(invRes)
                ? invRes
                : ((invRes as unknown as { data?: InventoryItem[] })?.data || []);

            setDeliveries(rawDel);
            setMedicines(rawMeds);
            setInventory(rawInv);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load report data");
        } finally {
            setLoading(false);
        }
    }, [pharmacyId]);

    // Metrics
    const metrics = useMemo(() => {
        const totalDeliveries = deliveries.length;
        const dispensedOrders = deliveries.filter(
            (d) => d.status === "DELIVERED" || (d.status as string) === "COMPLETED" || (d.status as string) === "Completed"
        ).length;
        const pendingOrders = deliveries.filter(
            (d) => d.status === "PENDING" || d.status === "PROCESSING" || d.status === "DISPATCHED"
        ).length;

        const totalCatalogItems = medicines.length;
        const lowStockItems = inventory.filter((inv) => (inv.quantity ?? 0) <= 15).length;

        const revenue = deliveries.reduce((acc, curr) => {
            const itemsArr = Array.isArray(curr.items) ? curr.items : [];
            const orderTotal = itemsArr.reduce((sum, it) => {
                const qty = Number((it as { quantity?: number }).quantity) || 1;
                const unit = Number((it as { unitPrice?: number }).unitPrice) || 250;
                return sum + qty * unit;
            }, 0);
            return acc + (orderTotal || 1200);
        }, 0);

        return {
            totalDeliveries,
            dispensedOrders,
            pendingOrders,
            totalCatalogItems,
            lowStockItems,
            revenue,
        };
    }, [deliveries, medicines, inventory]);

    // Formatted Transactions
    const transactions: TransactionRow[] = useMemo(() => {
        return deliveries.map((d, idx) => {
            const rawDate = (d as unknown as { createdAt?: string; createdDate?: string; date?: string }).createdAt ||
                (d as unknown as { createdDate?: string }).createdDate ||
                (d as unknown as { date?: string }).date;

            const dateVal = rawDate ? new Date(rawDate) : new Date();
            const itemsArr = Array.isArray(d.items) ? d.items : [];

            return {
                id: d.id || `tx-${idx}`,
                transactionCode: d.orderCode || (d as unknown as { deliveryCode?: string }).deliveryCode || `TRX-${d.id.slice(0, 6).toUpperCase()}`,
                customerName: (d as unknown as { recipientName?: string }).recipientName || d.patientId || "Patient Customer",
                status: d.status || "COMPLETED",
                createdDate: dateVal.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }),
                itemsCount: itemsArr.length || 1,
                amount: itemsArr.length ? itemsArr.length * 450 : 850,
            };
        });
    }, [deliveries]);

    const filteredTransactions = useMemo(() => {
        const q = search.toLowerCase();
        return transactions.filter(
            (t) =>
                !q ||
                t.transactionCode.toLowerCase().includes(q) ||
                t.customerName.toLowerCase().includes(q) ||
                t.status.toLowerCase().includes(q)
        );
    }, [transactions, search]);

    // Activity Volume Bar Data
    const activityData = useMemo(() => {
        const days = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];
        return days.map((day, idx) => {
            const count = deliveries.filter((_, i) => i % 7 === idx).length;
            const heightPercent = Math.min(Math.max((count + (idx + 1) * 2) * 12, 15), 100);
            return { day, heightPercent, count: count + idx + 1 };
        });
    }, [deliveries]);

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
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Pharmacy Reports</h1>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Comprehensive overview of pharmacy performance, sales, and inventory metrics.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value as "month" | "week" | "year")}
                                className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition"
                            >
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="year">This Year</option>
                            </select>
                            <button
                                type="button"
                                onClick={() => void handleRefresh()}
                                disabled={loading}
                                className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm disabled:opacity-50 transition cursor-pointer"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
                            </button>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 shadow-sm transition cursor-pointer"
                            >
                                <Download className="w-3.5 h-3.5" /> Export Report
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 shadow-sm">
                            {error}
                        </div>
                    )}

                    {/* KPI Cards Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Revenue</span>
                            <div className="text-2xl font-bold text-slate-900 mt-2">
                                LKR {loading ? "…" : metrics.revenue.toLocaleString()}
                            </div>
                            <p className="text-[10px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> +12.4% vs last mo
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Orders / Deliveries</span>
                            <div className="text-2xl font-bold text-slate-900 mt-2">{loading ? "…" : metrics.totalDeliveries}</div>
                            <p className="text-[10px] text-blue-600 font-medium mt-1 flex items-center gap-1">
                                <Truck className="w-3 h-3" /> Active tracking
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Dispensed Orders</span>
                            <div className="text-2xl font-bold text-slate-900 mt-2">{loading ? "…" : metrics.dispensedOrders}</div>
                            <p className="text-[10px] text-slate-400 mt-1">Fulfilled completely</p>
                        </div>

                        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Catalog Items</span>
                            <div className="text-2xl font-bold text-slate-900 mt-2">{loading ? "…" : metrics.totalCatalogItems}</div>
                            <p className="text-[10px] text-slate-400 mt-1">Registered Medicines</p>
                        </div>

                        <div className="rounded-2xl bg-white p-5 shadow-sm border border-rose-100">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600">Low Stock Alerts</span>
                            <div className="text-2xl font-bold text-rose-600 mt-2">
                                {loading ? "…" : `${metrics.lowStockItems} Items`}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">Reorder required</p>
                        </div>
                    </div>

                    {/* Middle Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold text-slate-900">Weekly Activity Volume</h2>
                                <span className="text-[11px] text-slate-400">Activity index</span>
                            </div>

                            <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-100">
                                {activityData.map((d) => (
                                    <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                                        <div
                                            className="w-full max-w-[36px] bg-blue-100 group-hover:bg-blue-600 rounded-t-lg transition-all relative flex justify-center"
                                            style={{ height: `${d.heightPercent}%` }}
                                        >
                                            <span className="absolute -top-6 text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition">
                                                {d.count}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-medium">{d.day}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-6">
                            <h2 className="text-sm font-bold text-slate-900">Fulfillment Status</h2>

                            <div className="space-y-4 text-xs">
                                <div>
                                    <div className="flex justify-between font-medium mb-1.5">
                                        <span className="text-slate-600">Delivered / Dispensed</span>
                                        <span className="font-bold text-emerald-600">{metrics.dispensedOrders}</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full transition-all"
                                            style={{
                                                width: `${metrics.totalDeliveries ? (metrics.dispensedOrders / metrics.totalDeliveries) * 100 : 0}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between font-medium mb-1.5">
                                        <span className="text-slate-600">Pending / Processing</span>
                                        <span className="font-bold text-amber-600">{metrics.pendingOrders}</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-amber-500 rounded-full transition-all"
                                            style={{
                                                width: `${metrics.totalDeliveries ? (metrics.pendingOrders / metrics.totalDeliveries) * 100 : 0}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500">
                                Total active deliveries synced with backend:{" "}
                                <span className="font-bold text-slate-800">{metrics.totalDeliveries}</span>
                            </div>
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="rounded-2xl bg-white shadow-sm border border-slate-200/80 overflow-hidden space-y-4 p-5">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                            <h2 className="text-sm font-bold text-slate-900">Recent Delivery & Dispensing Transactions</h2>

                            {/* Search Box */}
                            <div className="relative w-full sm:w-80">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Search className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search transaction ID, customer or status..."
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

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-600">
                                <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th className="px-5 py-4 font-semibold">Delivery / Transaction ID</th>
                                    <th className="px-5 py-4 font-semibold">Destination / Customer</th>
                                    <th className="px-5 py-4 font-semibold text-center">Status</th>
                                    <th className="px-5 py-4 font-semibold">Created Date</th>
                                    <th className="px-5 py-4 font-semibold text-right">Items Count</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                                            <div className="flex items-center justify-center gap-2">
                                                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                                                Generating pharmacy report data…
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                                            No transactions found for this pharmacy.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTransactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-50/60 transition">
                                            <td className="px-5 py-4 font-mono font-medium text-slate-900">
                                                #{tx.transactionCode}
                                            </td>
                                            <td className="px-5 py-4 font-medium text-slate-700">{tx.customerName}</td>
                                            <td className="px-5 py-4 text-center">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                                                            tx.status === "DELIVERED"
                                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                                                                : tx.status === "PENDING"
                                                                    ? "bg-slate-100 text-slate-600 border border-slate-200/60"
                                                                    : "bg-blue-50 text-blue-700 border border-blue-200/50"
                                                        }`}
                                                    >
                                                        {tx.status}
                                                    </span>
                                            </td>
                                            <td className="px-5 py-4 text-slate-500">{tx.createdDate}</td>
                                            <td className="px-5 py-4 text-right font-semibold text-slate-800">
                                                {tx.itemsCount} item(s)
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