// src/app/pharmacy/inventory/expiry/page.tsx
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Search, RefreshCw } from "lucide-react";
import { Sidebar } from "@/components/ui/Sidebar"; // ඔබේ Sidebar component එක පිහිටි path එක
import { usePharmacyId } from "@/hooks/usePharmacyId";
import { getInventoryByPharmacy, getAllMedicines, updateStock } from "@/services/pharmacyService";
import type { InventoryItem, Medicine } from "@/types/pharmacy";

interface ExpiryItem {
    id: string;
    medicineId?: string;
    medicineName: string;
    manufacturer: string;
    batchNumber: string;
    stock: number;
    unitPrice: number;
    expiryDateStr: string;
    daysLeft: number;
    status: "Critical" | "Warning" | "Expired" | "Safe";
}

export default function ExpiryManagementPage() {
    // Sidebar State Controls
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const { pharmacyId, loading: pharmacyLoading } = usePharmacyId();
    const [items, setItems] = useState<ExpiryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [selectedItem, setSelectedItem] = useState<ExpiryItem | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function fetchExpiryData() {
            if (!pharmacyId) {
                if (isMounted) setLoading(false);
                return;
            }

            try {
                if (isMounted) {
                    setLoading(true);
                    setError(null);
                }

                const [invRes, medRes] = await Promise.all([
                    getInventoryByPharmacy(pharmacyId).catch(() => [] as InventoryItem[]),
                    getAllMedicines().catch(() => [] as Medicine[]),
                ]);

                if (!isMounted) return;

                const rawInv = Array.isArray(invRes)
                    ? invRes
                    : ((invRes as unknown as { data?: InventoryItem[] })?.data || []);
                const rawMeds = Array.isArray(medRes)
                    ? medRes
                    : ((medRes as unknown as { data?: Medicine[] })?.data || []);

                const medMap = new Map<string, Medicine>();
                rawMeds.forEach((m) => {
                    if (m.id) medMap.set(m.id, m);
                });

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const formatted: ExpiryItem[] = rawInv
                    .map((item, idx) => {
                        const med = item.medicineId ? medMap.get(item.medicineId) : undefined;
                        const name = med?.name || (item as unknown as { medicineName?: string }).medicineName || `Medicine ${idx + 1}`;
                        const mfg = med?.manufacturer || "Pharmaceuticals";
                        const price = Number(med?.unitPrice ?? 10);
                        const stock = item.quantity ?? 0;
                        const batch = item.batchNumber || `BAT-${idx + 100}`;

                        const expRaw = item.expiryDate || (item as unknown as { expiry?: string }).expiry;
                        let daysLeft = 999;
                        let expDisplay = "—";

                        if (expRaw) {
                            const expDate = new Date(expRaw);
                            expDate.setHours(0, 0, 0, 0);
                            const diffTime = expDate.getTime() - today.getTime();
                            daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            expDisplay = expDate.toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            });
                        }

                        let status: ExpiryItem["status"] = "Safe";
                        if (daysLeft <= 0) {
                            status = "Expired";
                        } else if (daysLeft <= 30) {
                            status = "Critical";
                        } else if (daysLeft <= 60) {
                            status = "Warning";
                        }

                        return {
                            id: item.id || `exp-${idx}`,
                            medicineId: item.medicineId,
                            medicineName: name,
                            manufacturer: mfg,
                            batchNumber: batch,
                            stock,
                            unitPrice: price,
                            expiryDateStr: expDisplay,
                            daysLeft,
                            status,
                        };
                    })
                    .sort((a, b) => a.daysLeft - b.daysLeft);

                setItems(formatted);
                setSelectedItem((prev) => prev ?? formatted[0] ?? null);
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : "Failed to load expiry data");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        if (!pharmacyLoading) {
            void fetchExpiryData();
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

            const [invRes, medRes] = await Promise.all([
                getInventoryByPharmacy(pharmacyId).catch(() => [] as InventoryItem[]),
                getAllMedicines().catch(() => [] as Medicine[]),
            ]);

            const rawInv = Array.isArray(invRes)
                ? invRes
                : ((invRes as unknown as { data?: InventoryItem[] })?.data || []);
            const rawMeds = Array.isArray(medRes)
                ? medRes
                : ((medRes as unknown as { data?: Medicine[] })?.data || []);

            const medMap = new Map<string, Medicine>();
            rawMeds.forEach((m) => {
                if (m.id) medMap.set(m.id, m);
            });

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const formatted: ExpiryItem[] = rawInv
                .map((item, idx) => {
                    const med = item.medicineId ? medMap.get(item.medicineId) : undefined;
                    const name = med?.name || (item as unknown as { medicineName?: string }).medicineName || `Medicine ${idx + 1}`;
                    const mfg = med?.manufacturer || "Pharmaceuticals";
                    const price = Number(med?.unitPrice ?? 10);
                    const stock = item.quantity ?? 0;
                    const batch = item.batchNumber || `BAT-${idx + 100}`;

                    const expRaw = item.expiryDate || (item as unknown as { expiry?: string }).expiry;
                    let daysLeft = 999;
                    let expDisplay = "—";

                    if (expRaw) {
                        const expDate = new Date(expRaw);
                        expDate.setHours(0, 0, 0, 0);
                        const diffTime = expDate.getTime() - today.getTime();
                        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        expDisplay = expDate.toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        });
                    }

                    let status: ExpiryItem["status"] = "Safe";
                    if (daysLeft <= 0) {
                        status = "Expired";
                    } else if (daysLeft <= 30) {
                        status = "Critical";
                    } else if (daysLeft <= 60) {
                        status = "Warning";
                    }

                    return {
                        id: item.id || `exp-${idx}`,
                        medicineId: item.medicineId,
                        medicineName: name,
                        manufacturer: mfg,
                        batchNumber: batch,
                        stock,
                        unitPrice: price,
                        expiryDateStr: expDisplay,
                        daysLeft,
                        status,
                    };
                })
                .sort((a, b) => a.daysLeft - b.daysLeft);

            setItems(formatted);
            setSelectedItem((prev) => prev ?? formatted[0] ?? null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load expiry data");
        } finally {
            setLoading(false);
        }
    }, [pharmacyId]);

    const metrics = useMemo(() => {
        const expiringIn30 = items.filter((i) => i.daysLeft > 0 && i.daysLeft <= 30).length;
        const expiringIn60 = items.filter((i) => i.daysLeft > 30 && i.daysLeft <= 60).length;
        const expired = items.filter((i) => i.daysLeft <= 0).length;
        const valueAtRisk = items
            .filter((i) => i.daysLeft <= 60)
            .reduce((sum, item) => sum + item.stock * item.unitPrice, 0);

        return { expiringIn30, expiringIn60, expired, valueAtRisk };
    }, [items]);

    const filtered = useMemo(() => {
        const query = search.toLowerCase();
        return items.filter((i) => {
            return (
                !query ||
                i.medicineName.toLowerCase().includes(query) ||
                i.batchNumber.toLowerCase().includes(query) ||
                i.manufacturer.toLowerCase().includes(query)
            );
        });
    }, [items, search]);

    const handleQuarantineDispose = async () => {
        if (!selectedItem) return;
        try {
            setActionLoading(true);
            await updateStock(selectedItem.id, { quantity: 0 });
            await handleRefresh();
            alert(`Batch ${selectedItem.batchNumber} has been successfully quarantined/disposed.`);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to update batch status");
        } finally {
            setActionLoading(false);
        }
    };

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
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Expiry Management</h1>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Monitor medicine expiry dates, batch risks, and manage disposal actions.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => void handleRefresh()}
                                disabled={loading}
                                className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm disabled:opacity-50 transition"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
                            </button>
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 shadow-sm transition"
                            >
                                Review Queue
                            </button>
                        </div>
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
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Expiring in 30 Days</span>
                                <span className="text-[10px] font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/50">
                  Immediate Action
                </span>
                            </div>
                            <div className="text-3xl font-bold text-slate-900 mt-3">{loading ? "…" : metrics.expiringIn30}</div>
                        </div>

                        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Expiring in 60 Days</span>
                                <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
                  Attention
                </span>
                            </div>
                            <div className="text-3xl font-bold text-slate-900 mt-3">{loading ? "…" : metrics.expiringIn60}</div>
                        </div>

                        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Expired Medicines</span>
                                <span className="text-[10px] font-medium text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                  Quarantined
                </span>
                            </div>
                            <div className="text-3xl font-bold text-slate-900 mt-3">{loading ? "…" : metrics.expired}</div>
                        </div>

                        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Stock Value at Risk</span>
                                <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  Estimated
                </span>
                            </div>
                            <div className="text-3xl font-bold text-slate-900 mt-3">
                                LKR {loading ? "…" : metrics.valueAtRisk.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Table Section */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                <h2 className="text-sm font-bold text-slate-900">Expiry Inventory</h2>

                                {/* Search Box */}
                                <div className="relative w-full sm:w-80">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Search className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search batch or medicine..."
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

                            <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200/80">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs text-slate-600">
                                        <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wider text-slate-400">
                                        <tr>
                                            <th className="px-5 py-4 font-semibold">Medicine Details</th>
                                            <th className="px-5 py-4 font-semibold">Batch No</th>
                                            <th className="px-5 py-4 font-semibold">Stock</th>
                                            <th className="px-5 py-4 font-semibold">Expiry Date</th>
                                            <th className="px-5 py-4 font-semibold">Days Left</th>
                                            <th className="px-5 py-4 font-semibold text-center">Status</th>
                                            <th className="px-5 py-4 font-semibold text-right">Action</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                                                        Checking medicine expiry dates…
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : filtered.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                                                    No medicine batches match your search criteria.
                                                </td>
                                            </tr>
                                        ) : (
                                            filtered.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    onClick={() => setSelectedItem(item)}
                                                    className={`cursor-pointer transition ${
                                                        selectedItem?.id === item.id ? "bg-blue-50/50" : "hover:bg-slate-50/60"
                                                    }`}
                                                >
                                                    <td className="px-5 py-4">
                                                        <p className="font-semibold text-slate-900">{item.medicineName}</p>
                                                        <span className="text-[10px] text-slate-400">{item.manufacturer}</span>
                                                    </td>
                                                    <td className="px-5 py-4 font-mono text-slate-600">{item.batchNumber}</td>
                                                    <td className="px-5 py-4 font-semibold text-slate-800">{item.stock}</td>
                                                    <td className="px-5 py-4 text-slate-500">{item.expiryDateStr}</td>
                                                    <td className="px-5 py-4 font-bold text-rose-600">
                                                        {item.daysLeft <= 0 ? "Expired" : `${item.daysLeft}d`}
                                                    </td>
                                                    <td className="px-5 py-4 text-center">
                              <span
                                  className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                                      item.status === "Critical"
                                          ? "bg-rose-50 text-rose-700 border border-rose-200/50"
                                          : item.status === "Warning"
                                              ? "bg-amber-50 text-amber-700 border border-amber-200/50"
                                              : item.status === "Expired"
                                                  ? "bg-rose-100 text-rose-800"
                                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                                  }`}
                              >
                                {item.status}
                              </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedItem(item);
                                                            }}
                                                            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                                                        >
                                                            Inspect
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Right Rules & Inspection Panel */}
                        <div className="space-y-6">
                            <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 space-y-3">
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Expiry Rules & Alerts</h3>
                                <div className="space-y-2.5 text-xs">
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                        <span className="text-slate-500">Early Warning</span>
                                        <span className="font-semibold text-slate-800">60 Days</span>
                                    </div>
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                        <span className="text-slate-500">Critical Warning</span>
                                        <span className="font-semibold text-rose-600">30 Days</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">Dispensing Block</span>
                                        <span className="font-semibold text-slate-800">0 Days (Expired)</span>
                                    </div>
                                </div>
                            </div>

                            {selectedItem && (
                                <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                            Selected Batch Inspection
                                        </h3>
                                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/50">
                      {selectedItem.status}
                    </span>
                                    </div>

                                    <div className="text-xs space-y-1">
                                        <p className="font-bold text-sm text-slate-900">{selectedItem.medicineName}</p>
                                        <p className="text-slate-500">
                                            Batch: <span className="font-mono text-slate-700">{selectedItem.batchNumber}</span>
                                        </p>
                                        <p className="text-slate-500">
                                            Stock: <span className="font-semibold text-slate-800">{selectedItem.stock} units</span> | Exp: {selectedItem.expiryDateStr}
                                        </p>
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        <button
                                            type="button"
                                            disabled={actionLoading}
                                            onClick={() => alert(`Return process initiated for Batch ${selectedItem.batchNumber}`)}
                                            className="w-full py-2.5 px-3 border border-slate-200 bg-white rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
                                        >
                                            Return to Supplier
                                        </button>
                                        <button
                                            type="button"
                                            disabled={actionLoading}
                                            onClick={() => void handleQuarantineDispose()}
                                            className="w-full py-2.5 px-3 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 shadow-sm transition disabled:opacity-50"
                                        >
                                            {actionLoading ? "Processing..." : "Quarantine / Dispose"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}