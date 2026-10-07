// src/app/pharmacy/inventory/page.tsx
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { Search, RefreshCw, Plus, Package, AlertTriangle, Clock } from "lucide-react";
import { Sidebar } from "@/components/ui/Sidebar"; // ඔබේ Sidebar component එක පිහිටි path එක
import { usePharmacyId } from "@/hooks/usePharmacyId";
import { getInventoryByPharmacy, getAllMedicines } from "@/services/pharmacyService";
import type { InventoryItem, Medicine } from "@/types/pharmacy";

interface ExtendedInventoryItem {
    id: string;
    medicineId?: string;
    medicineName: string;
    category: string;
    quantity: number;
    batchNumber: string;
    expiryDate: string;
    status: "In Stock" | "Low Stock" | "Expiring Soon" | "Out of Stock";
}

export default function MedicineInventoryPage() {
    // Sidebar State Controls
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const { pharmacyId, loading: pharmacyLoading } = usePharmacyId();
    const [inventory, setInventory] = useState<ExtendedInventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    useEffect(() => {
        let isMounted = true;

        async function loadData() {
            if (!pharmacyId) {
                if (isMounted) {
                    setLoading(false);
                }
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
                const thirtyDaysLater = new Date();
                thirtyDaysLater.setDate(today.getDate() + 30);

                const items: ExtendedInventoryItem[] = rawInv.map((item, index) => {
                    const matchedMed = item.medicineId ? medMap.get(item.medicineId) : undefined;
                    const name = matchedMed?.name || (item as unknown as { name?: string }).name || `Medicine ${index + 1}`;
                    const cat = (matchedMed as { category?: string })?.category || (item as unknown as { category?: string }).category || "General";
                    const qty = item.quantity ?? 0;
                    const exp = item.expiryDate || (item as unknown as { expiry?: string }).expiry || "";
                    const expDate = exp ? new Date(exp) : null;

                    let status: ExtendedInventoryItem["status"] = "In Stock";
                    if (qty <= 0) {
                        status = "Out of Stock";
                    } else if (qty < 10) {
                        status = "Low Stock";
                    } else if (expDate && expDate <= thirtyDaysLater) {
                        status = "Expiring Soon";
                    }

                    return {
                        id: item.id || `inv-${index}`,
                        medicineId: item.medicineId,
                        medicineName: name,
                        category: cat,
                        quantity: qty,
                        batchNumber: item.batchNumber || `BAT-${index + 100}`,
                        expiryDate: exp ? new Date(exp).toLocaleDateString("en-GB") : "—",
                        status,
                    };
                });

                setInventory(items);
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : "Failed to load inventory data");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        if (!pharmacyLoading) {
            void loadData();
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
            const thirtyDaysLater = new Date();
            thirtyDaysLater.setDate(today.getDate() + 30);

            const items: ExtendedInventoryItem[] = rawInv.map((item, index) => {
                const matchedMed = item.medicineId ? medMap.get(item.medicineId) : undefined;
                const name = matchedMed?.name || (item as unknown as { name?: string }).name || `Medicine ${index + 1}`;
                const cat = (matchedMed as { category?: string })?.category || (item as unknown as { category?: string }).category || "General";
                const qty = item.quantity ?? 0;
                const exp = item.expiryDate || (item as unknown as { expiry?: string }).expiry || "";
                const expDate = exp ? new Date(exp) : null;

                let status: ExtendedInventoryItem["status"] = "In Stock";
                if (qty <= 0) {
                    status = "Out of Stock";
                } else if (qty < 10) {
                    status = "Low Stock";
                } else if (expDate && expDate <= thirtyDaysLater) {
                    status = "Expiring Soon";
                }

                return {
                    id: item.id || `inv-${index}`,
                    medicineId: item.medicineId,
                    medicineName: name,
                    category: cat,
                    quantity: qty,
                    batchNumber: item.batchNumber || `BAT-${index + 100}`,
                    expiryDate: exp ? new Date(exp).toLocaleDateString("en-GB") : "—",
                    status,
                };
            });

            setInventory(items);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to refresh inventory");
        } finally {
            setLoading(false);
        }
    }, [pharmacyId]);

    const kpis = useMemo(() => {
        const totalSKUs = inventory.length;
        const lowStock = inventory.filter((i) => i.status === "Low Stock" || i.status === "Out of Stock").length;
        const expiringSoon = inventory.filter((i) => i.status === "Expiring Soon").length;
        return { totalSKUs, lowStock, expiringSoon };
    }, [inventory]);

    const filtered = useMemo(() => {
        return inventory.filter((item) => {
            const matchesSearch =
                !search ||
                item.medicineName.toLowerCase().includes(search.toLowerCase()) ||
                item.category.toLowerCase().includes(search.toLowerCase()) ||
                item.batchNumber.toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "IN_STOCK" && item.status === "In Stock") ||
                (statusFilter === "LOW_STOCK" && item.status === "Low Stock") ||
                (statusFilter === "EXPIRING" && item.status === "Expiring Soon") ||
                (statusFilter === "OUT_OF_STOCK" && item.status === "Out of Stock");

            return matchesSearch && matchesStatus;
        });
    }, [inventory, search, statusFilter]);

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
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Medicine Inventory</h1>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Stock, dispensing, procurement, and safety management in one place.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => void handleRefresh()}
                                disabled={loading}
                                className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm disabled:opacity-50 transition"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
                            </button>
                            <Link
                                href="/pharmacy/medicines/new"
                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 shadow-sm transition"
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

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-500">Total SKUs</span>
                                <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
                                    <Package className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-slate-900 mt-2">{loading ? "…" : kpis.totalSKUs}</div>
                            <p className="text-[11px] text-slate-400 mt-1">Across all categories</p>
                        </div>

                        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-500">Low Stock</span>
                                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                                    <AlertTriangle className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-amber-600 mt-2">{loading ? "…" : kpis.lowStock}</div>
                            <p className="text-[11px] text-slate-400 mt-1">Needs reorder soon</p>
                        </div>

                        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-500">Expiring in 30 Days</span>
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Clock className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-rose-600 mt-2">{loading ? "…" : kpis.expiringSoon}</div>
                            <p className="text-[11px] text-slate-400 mt-1">Rotate or return</p>
                        </div>
                    </div>

                    {/* Filter and Search Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="relative w-full sm:flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search medicine name, category, or batch number..."
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
                            className="w-full sm:w-48 py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="IN_STOCK">In Stock</option>
                            <option value="LOW_STOCK">Low Stock</option>
                            <option value="EXPIRING">Expiring Soon</option>
                            <option value="OUT_OF_STOCK">Out of Stock</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200/80">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-600">
                                <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th className="px-5 py-4 font-semibold">Medicine</th>
                                    <th className="px-5 py-4 font-semibold">Category</th>
                                    <th className="px-5 py-4 font-semibold">Stock</th>
                                    <th className="px-5 py-4 font-semibold">Batch</th>
                                    <th className="px-5 py-4 font-semibold">Expiry</th>
                                    <th className="px-5 py-4 font-semibold text-center">Status</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                                            <div className="flex items-center justify-center gap-2">
                                                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                                                Loading inventory data…
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                                            No matching items found.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/60 transition">
                                            <td className="px-5 py-4 font-medium text-slate-900">{item.medicineName}</td>
                                            <td className="px-5 py-4 text-slate-600">{item.category}</td>
                                            <td className="px-5 py-4 font-semibold text-slate-800">{item.quantity}</td>
                                            <td className="px-5 py-4 font-mono text-slate-500">{item.batchNumber}</td>
                                            <td className="px-5 py-4 text-slate-500">{item.expiryDate}</td>
                                            <td className="px-5 py-4 text-center">
                          <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                                  item.status === "In Stock"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                                      : item.status === "Low Stock"
                                          ? "bg-amber-50 text-amber-700 border border-amber-200/50"
                                          : item.status === "Expiring Soon"
                                              ? "bg-rose-50 text-rose-700 border border-rose-200/50"
                                              : "bg-slate-100 text-slate-600"
                              }`}
                          >
                            {item.status}
                          </span>
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