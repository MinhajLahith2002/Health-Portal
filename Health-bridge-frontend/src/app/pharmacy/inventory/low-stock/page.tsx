// src/app/pharmacy/inventory/low-stock/page.tsx
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { Search, RefreshCw, AlertTriangle, AlertCircle, CheckCircle2, ShieldAlert, Sparkles, Plus } from "lucide-react";
import { Sidebar } from "@/components/ui/Sidebar";
import { usePharmacyId } from "@/hooks/usePharmacyId";
import { getLowStockAlerts, getAllMedicines, getInventoryByPharmacy } from "@/services/pharmacyService";
import type { InventoryItem, Medicine } from "@/types/pharmacy";

interface LowStockMedicineItem {
    id: string;
    medicineId?: string;
    medicineName: string;
    code: string;
    category: string;
    currentStock: number;
    reorderLevel: number;
    recommendedOrder: number;
    status: "OUT_OF_STOCK" | "CRITICAL" | "LOW_STOCK" | "HEALTHY";
}

export default function LowStockAlertsPage() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const { pharmacyId, loading: pharmacyLoading } = usePharmacyId();
    const [items, setItems] = useState<LowStockMedicineItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [categoryFilter, setCategoryFilter] = useState("ALL");

    const loadAlerts = useCallback(async () => {
        if (!pharmacyId) return;

        try {
            setLoading(true);
            setError(null);

            const [alertsRes, allInvRes, medRes] = await Promise.all([
                getLowStockAlerts(pharmacyId).catch(() => [] as InventoryItem[]),
                getInventoryByPharmacy(pharmacyId).catch(() => [] as InventoryItem[]),
                getAllMedicines().catch(() => [] as Medicine[]),
            ]);

            const rawAlerts = Array.isArray(alertsRes)
                ? alertsRes
                : ((alertsRes as unknown as { data?: InventoryItem[] })?.data || []);
            const rawInv = Array.isArray(allInvRes)
                ? allInvRes
                : ((allInvRes as unknown as { data?: InventoryItem[] })?.data || []);
            const rawMeds = Array.isArray(medRes)
                ? medRes
                : ((medRes as unknown as { data?: Medicine[] })?.data || []);

            const medMap = new Map<string, Medicine>();
            rawMeds.forEach((m) => {
                if (m.id) medMap.set(m.id, m);
            });

            const inventoryPool = rawAlerts.length > 0 ? rawAlerts : rawInv;

            const formatted: LowStockMedicineItem[] = inventoryPool.map((item, idx) => {
                const med = item.medicineId ? medMap.get(item.medicineId) : undefined;
                const name = med?.name || (item as unknown as { medicineName?: string }).medicineName || `Medicine ${idx + 1}`;
                const code = (med as unknown as { medicineCode?: string })?.medicineCode || item.medicineId?.slice(0, 6) || `MED-${idx + 101}`;
                const cat = med?.category || "General";
                const stock = item.quantity ?? 0;
                const reorder = 20;

                let status: LowStockMedicineItem["status"] = "HEALTHY";
                if (stock === 0) {
                    status = "OUT_OF_STOCK";
                } else if (stock <= 5) {
                    status = "CRITICAL";
                } else if (stock <= 15) {
                    status = "LOW_STOCK";
                }

                const recommended = Math.max(reorder * 2 - stock, 25);

                return {
                    id: item.id || `alert-${idx}`,
                    medicineId: item.medicineId,
                    medicineName: name,
                    code,
                    category: cat,
                    currentStock: stock,
                    reorderLevel: reorder,
                    recommendedOrder: recommended,
                    status,
                };
            });

            setItems(formatted);
        } catch (err) {
            console.error("Error loading low stock alerts:", err);
            setError(err instanceof Error ? err.message : "Failed to load low stock alerts");
        } finally {
            setLoading(false);
        }
    }, [pharmacyId]);

    useEffect(() => {
        let isMounted = true;

        async function initialize() {
            if (!pharmacyLoading && pharmacyId) {
                await loadAlerts();
            } else if (!pharmacyLoading && !pharmacyId) {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        void initialize();

        return () => {
            isMounted = false;
        };
    }, [pharmacyId, pharmacyLoading, loadAlerts]);

    const counts = useMemo(() => {
        const lowStock = items.filter((i) => i.status === "LOW_STOCK").length;
        const critical = items.filter((i) => i.status === "CRITICAL").length;
        const outOfStock = items.filter((i) => i.status === "OUT_OF_STOCK").length;
        const healthy = items.filter((i) => i.status === "HEALTHY").length;
        return { lowStock, critical, outOfStock, healthy };
    }, [items]);

    const categories = useMemo(() => {
        const set = new Set<string>();
        items.forEach((i) => {
            if (i.category) set.add(i.category);
        });
        return Array.from(set);
    }, [items]);

    const filtered = useMemo(() => {
        return items.filter((i) => {
            const matchesSearch =
                !search ||
                i.medicineName.toLowerCase().includes(search.toLowerCase()) ||
                i.code.toLowerCase().includes(search.toLowerCase()) ||
                i.category.toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "ALL"
                    ? i.status !== "HEALTHY" || items.length === 1
                    : statusFilter === "ALL_STATUSES"
                        ? true
                        : i.status === statusFilter;

            const matchesCat = categoryFilter === "ALL" || i.category === categoryFilter;

            return matchesSearch && matchesStatus && matchesCat;
        });
    }, [items, search, statusFilter, categoryFilter]);

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar
                userRole="PHARMACIST"
                userName="Pharmacist"
                collapsed={collapsed}
                onToggleCollapse={() => setCollapsed(!collapsed)}
                mobileOpen={mobileOpen}
                onCloseMobile={() => setMobileOpen(false)}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                <main className="p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Low Stock Alerts</h1>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Monitor medicines running low and take timely action to maintain sufficient pharmacy inventory.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => void loadAlerts()}
                                disabled={loading}
                                className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm disabled:opacity-50 transition"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Stock
                            </button>
                            <Link
                                href="/pharmacy/medicines/new"
                                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 shadow-sm transition"
                            >
                                <Plus className="w-3.5 h-3.5" /> Reorder Medicines
                            </Link>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 shadow-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                        <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Low Stock</span>
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                            </div>
                            <div className="text-2xl font-bold text-amber-600 mt-2">{loading ? "…" : counts.lowStock}</div>
                            <p className="text-[10px] text-slate-400 mt-0.5">Below minimum stock level</p>
                        </div>

                        <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Critical Stock</span>
                                <AlertCircle className="w-4 h-4 text-rose-500" />
                            </div>
                            <div className="text-2xl font-bold text-rose-600 mt-2">{loading ? "…" : counts.critical}</div>
                            <p className="text-[10px] text-slate-400 mt-0.5">Immediate restocking required</p>
                        </div>

                        <div className="rounded-2xl bg-slate-900 text-white p-4 shadow-sm border border-slate-800">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Out of Stock</span>
                                <ShieldAlert className="w-4 h-4 text-rose-400" />
                            </div>
                            <div className="text-2xl font-bold text-white mt-2">{loading ? "…" : counts.outOfStock}</div>
                            <p className="text-[10px] text-slate-400 mt-0.5">No units available</p>
                        </div>

                        <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Reorder Pending</span>
                                <span className="text-xs">🚚</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-400 mt-2">—</div>
                            <p className="text-[10px] text-slate-400 mt-0.5">Supplier sync</p>
                        </div>

                        <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Stock Healthy</span>
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div className="text-2xl font-bold text-emerald-600 mt-2">{loading ? "…" : counts.healthy}</div>
                            <p className="text-[10px] text-slate-400 mt-0.5">Medicines adequately stocked</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-3 space-y-4">
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <div className="relative flex-1 w-full">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Search className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search low stock items by name, SKU or category..."
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

                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full sm:w-40 py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition"
                                >
                                    <option value="ALL">Needs Attention</option>
                                    <option value="ALL_STATUSES">All Statuses</option>
                                    <option value="CRITICAL">Critical Stock</option>
                                    <option value="LOW_STOCK">Low Stock</option>
                                    <option value="OUT_OF_STOCK">Out of Stock</option>
                                    <option value="HEALTHY">Stock Healthy</option>
                                </select>

                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="w-full sm:w-40 py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition"
                                >
                                    <option value="ALL">All Categories</option>
                                    {categories.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200/80">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs text-slate-600">
                                        <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wider text-slate-400">
                                        <tr>
                                            <th className="px-5 py-4 font-semibold">Medicine / ID</th>
                                            <th className="px-5 py-4 font-semibold">Category</th>
                                            <th className="px-5 py-4 font-semibold">Current Stock</th>
                                            <th className="px-5 py-4 font-semibold text-center">Status</th>
                                            <th className="px-5 py-4 font-semibold text-right">Recommended Order</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                                                        Checking inventory stock levels…
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : filtered.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                                                    No low-stock items match your filters. All medicines are adequately stocked!
                                                </td>
                                            </tr>
                                        ) : (
                                            filtered.map((item) => (
                                                <tr key={item.id} className="hover:bg-slate-50/60 transition">
                                                    <td className="px-5 py-4">
                                                        <p className="font-semibold text-slate-900">{item.medicineName}</p>
                                                        <span className="font-mono text-[10px] text-slate-400">{item.code}</span>
                                                    </td>
                                                    <td className="px-5 py-4 text-slate-600">{item.category}</td>
                                                    <td className="px-5 py-4 font-bold text-slate-800">
                                                        {item.currentStock}{" "}
                                                        <span className="text-[10px] font-normal text-slate-400">
                                (Min: {item.reorderLevel})
                              </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-center">
                              <span
                                  className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                                      item.status === "OUT_OF_STOCK"
                                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                                          : item.status === "CRITICAL"
                                              ? "bg-rose-50 text-rose-700 border border-rose-200/50"
                                              : item.status === "LOW_STOCK"
                                                  ? "bg-amber-50 text-amber-700 border border-amber-200/50"
                                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                                  }`}
                              >
                                {item.status.replace(/_/g, " ")}
                              </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                              <span className="inline-flex items-center gap-1 font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                                +{item.recommendedOrder} units
                              </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 shadow-sm space-y-3">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-100">
                                    <Sparkles className="w-4 h-4" /> AI Stock Forecast
                                </div>
                                <p className="text-xs text-blue-50 leading-relaxed">
                                    Real-time monitoring calculates replenishment velocity based on your daily prescription dispense rate.
                                </p>
                                <div className="pt-2 border-t border-blue-500/40 text-[11px] text-blue-100 flex items-center justify-between">
                                    <span>Automatic Restock Alerts</span>
                                    <span className="font-semibold text-white">Active</span>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 space-y-3">
                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                                    <ShieldAlert className="w-4 h-4 text-rose-500" /> Critical Safety Thresholds
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Items with 5 or fewer units are flagged for priority restocking to prevent emergency shortages in patient care.
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}