// src/app/pharmacy/dashboard/page.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
    Pill,
    AlertTriangle,
    Truck,
    DollarSign,
    Bell,
    ArrowRight,
    Plus,
    ClipboardList,
    Boxes,
    RefreshCw,
    TrendingUp,
    Clock,
    CheckCircle2,
} from "lucide-react";
import { Sidebar } from "@/components/ui/Sidebar"; // ඔබේ Sidebar එක පිහිටි path එක (e.g., @/components/ui/Sidebar)
import { usePharmacyId } from "@/hooks/usePharmacyId";
import {
    getAllMedicines,
    getLowStockAlerts,
    getDeliveriesByPharmacy,
    getInventoryByPharmacy,
    createDelivery,
} from "@/services/pharmacyService";
import type { Medicine, InventoryItem, Delivery } from "@/types/pharmacy";

type ExtendedDelivery = {
    id?: string;
    orderCode?: string;
    deliveryCode?: string;
    status?: string;
    address?: string;
    deliveryAddress?: string;
    recipientName?: string;
    patientId?: string;
    createdAt?: string;
    totalAmount?: number;
    amount?: number;
    items?: Array<{
        medicineName?: string;
        quantity?: number;
        unitPrice?: number;
        [key: string]: unknown;
    }>;
    [key: string]: unknown;
};

type DashboardItem = {
    id?: string;
    medicineId?: string;
    name?: string;
    medicineName?: string;
    category?: string;
    quantity?: number;
    stock?: number;
    [key: string]: unknown;
};

export default function PharmacyDashboardPage() {
    // Sidebar State Controls
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const { pharmacyId, loading: pharmacyLoading } = usePharmacyId();
    const [isFetching, setIsFetching] = useState(false);
    const [creatingOrder, setCreatingOrder] = useState(false);

    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [lowStockAlerts, setLowStockAlerts] = useState<InventoryItem[]>([]);
    const [deliveries, setDeliveries] = useState<ExtendedDelivery[]>([]);
    const [inventory, setInventory] = useState<DashboardItem[]>([]);

    useEffect(() => {
        let isMounted = true;

        async function loadData() {
            if (!pharmacyId) {
                if (isMounted) setIsFetching(false);
                return;
            }

            try {
                if (isMounted) setIsFetching(true);

                const [medRes, lowStockRes, delRes, invRes] = await Promise.all([
                    getAllMedicines().catch(() => [] as Medicine[]),
                    getLowStockAlerts(pharmacyId).catch(() => [] as InventoryItem[]),
                    getDeliveriesByPharmacy(pharmacyId).catch(() => [] as ExtendedDelivery[]),
                    getInventoryByPharmacy(pharmacyId).catch(() => [] as DashboardItem[]),
                ]);

                if (!isMounted) return;

                const medData = Array.isArray(medRes) ? medRes : (medRes as { data?: Medicine[] })?.data || [];
                const stockData = Array.isArray(lowStockRes) ? lowStockRes : (lowStockRes as { data?: InventoryItem[] })?.data || [];
                const delData = Array.isArray(delRes) ? delRes : (delRes as { data?: ExtendedDelivery[] })?.data || [];
                const invData = Array.isArray(invRes)
                    ? (invRes as unknown as DashboardItem[])
                    : ((invRes as { data?: unknown })?.data as DashboardItem[]) || [];

                setMedicines(medData);
                setLowStockAlerts(stockData);
                setDeliveries(delData as ExtendedDelivery[]);
                setInventory(invData);
            } catch (err) {
                if (isMounted) {
                    console.error("Failed to load dashboard metrics:", err);
                }
            } finally {
                if (isMounted) {
                    setIsFetching(false);
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
            setIsFetching(true);
            const [medRes, lowStockRes, delRes, invRes] = await Promise.all([
                getAllMedicines().catch(() => [] as Medicine[]),
                getLowStockAlerts(pharmacyId).catch(() => [] as InventoryItem[]),
                getDeliveriesByPharmacy(pharmacyId).catch(() => [] as ExtendedDelivery[]),
                getInventoryByPharmacy(pharmacyId).catch(() => [] as DashboardItem[]),
            ]);

            const medData = Array.isArray(medRes) ? medRes : (medRes as { data?: Medicine[] })?.data || [];
            const stockData = Array.isArray(lowStockRes) ? lowStockRes : (lowStockRes as { data?: InventoryItem[] })?.data || [];
            const delData = Array.isArray(delRes) ? delRes : (delRes as { data?: ExtendedDelivery[] })?.data || [];
            const invData = Array.isArray(invRes)
                ? (invRes as unknown as DashboardItem[])
                : ((invRes as { data?: unknown })?.data as DashboardItem[]) || [];

            setMedicines(medData);
            setLowStockAlerts(stockData);
            setDeliveries(delData as ExtendedDelivery[]);
            setInventory(invData);
        } catch (err) {
            console.error("Failed to refresh dashboard:", err);
        } finally {
            setIsFetching(false);
        }
    }, [pharmacyId]);

    const handleCreateTestOrder = async () => {
        if (!pharmacyId) {
            alert("Pharmacy ID is not ready yet.");
            return;
        }

        try {
            setCreatingOrder(true);
            const newOrderPayload = {
                pharmacyId,
                patientId: `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
                fulfillmentType: "Doorstep Delivery",
                status: "PROCESSING",
                deliveryAddress: "No 45 Central Road Colombo",
                address: "No 45 Central Road Colombo",
                courierService: "HealthBridge Express",
                assignedRiderName: "David Perera",
                items: [
                    {
                        medicineName: medicines[0]?.name || "Paracetamol 500mg",
                        quantity: 2,
                        unitPrice: medicines[0]?.unitPrice || 250,
                    },
                ],
            };

            await createDelivery(newOrderPayload as unknown as Partial<Delivery> & { items: unknown[] });
            await handleRefresh();
            alert("Test Delivery Order successfully generated in the backend!");
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to create order");
        } finally {
            setCreatingOrder(false);
        }
    };

    const loading = pharmacyLoading || isFetching;

    const dashboardMetrics = useMemo(() => {
        const todayStr = new Date().toDateString();

        const todayDeliveries = deliveries.filter((del) => {
            if (!del.createdAt) return true;
            return new Date(del.createdAt).toDateString() === todayStr;
        });

        const activeDeliveriesCount = deliveries.length;

        const totalRevenue = deliveries.reduce((sum, curr) => {
            if (curr.totalAmount) return sum + Number(curr.totalAmount);
            if (curr.amount) return sum + Number(curr.amount);
            const itemsArr = Array.isArray(curr.items) ? curr.items : [];
            const itemSubtotal = itemsArr.reduce((acc, it) => acc + (it.quantity || 1) * (it.unitPrice || 250), 0);
            return sum + (itemSubtotal || 1250);
        }, 0);

        const pendingOrders = deliveries.filter(
            (del) =>
                (del.status || "").toUpperCase() !== "DELIVERED" &&
                (del.status || "").toUpperCase() !== "CANCELLED"
        );

        return {
            todayOrdersCount: todayDeliveries.length || activeDeliveriesCount,
            todayRevenue: totalRevenue,
            pendingOrdersList: pendingOrders,
            pendingCount: pendingOrders.length,
        };
    }, [deliveries]);

    const currentDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const catalogDisplayList: DashboardItem[] = useMemo(() => {
        if (inventory.length > 0) {
            return inventory.map((inv) => {
                const matched = medicines.find((m) => m.id === inv.medicineId);
                return {
                    id: inv.id,
                    name: matched?.name || inv.medicineName || inv.name || "Medicine Item",
                    category: matched?.category || inv.category || "General",
                    stock: inv.quantity ?? inv.stock ?? 0,
                };
            });
        }

        return medicines.map((m) => ({
            id: m.id,
            name: m.name,
            category: m.category || "Pharmaceuticals",
            stock: 0,
        }));
    }, [inventory, medicines]);

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
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-slate-900">Pharmacy Dashboard</h1>
                                <span className="text-xs text-slate-400 font-normal">| {currentDate}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Overview of real-time stock levels, orders, and fulfillment.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => void handleRefresh()}
                                disabled={!pharmacyId || loading}
                                className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm disabled:opacity-50 transition"
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

                    {/* Metric Cards Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-medium text-slate-500">Total Medicines</span>
                                <div className="p-2 bg-rose-50 text-rose-500 rounded-xl">
                                    <Pill className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-3 text-3xl font-bold text-slate-900">{loading ? "…" : medicines.length}</div>
                            <p className="text-[11px] text-slate-400 mt-1">Total registered catalog</p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-medium text-slate-500">Low Stock Alerts</span>
                                <div className="p-2 bg-amber-50 text-amber-500 rounded-xl">
                                    <AlertTriangle className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-3 text-3xl font-bold text-slate-900">{loading ? "…" : lowStockAlerts.length}</div>
                            <p className="text-[11px] text-slate-400 mt-1">Require immediate replenishment</p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-medium text-slate-500">Today&apos;s Orders</span>
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                    <Truck className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-3 text-3xl font-bold text-slate-900">
                                {loading ? "…" : dashboardMetrics.todayOrdersCount}
                            </div>
                            <p className="text-[11px] text-emerald-600 font-medium mt-1">Live fulfillment count</p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-medium text-slate-500">Today&apos;s Revenue</span>
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <DollarSign className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-3 text-3xl font-bold text-slate-900">
                                {loading ? "…" : `LKR ${dashboardMetrics.todayRevenue.toLocaleString()}`}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">Calculated from deliveries</p>
                        </div>
                    </div>

                    {/* Alerts Banner */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                                <Bell className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-xs font-semibold text-slate-800">Alerts & Notifications</h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {lowStockAlerts.length > 0
                                        ? `${lowStockAlerts.length} item(s) are critically low on stock.`
                                        : "No low-stock alerts right now. All inventory levels are optimal."}
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/pharmacy/inventory/low-stock"
                            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                        >
                            View All Alerts <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {/* 2-Column Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pending Orders & Deliveries */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    <h2 className="text-sm font-bold text-slate-900">Pending Orders & Deliveries</h2>
                                </div>
                                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200/60">
                  {dashboardMetrics.pendingCount} Pending
                </span>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {loading ? (
                                    <p className="text-xs text-slate-400 py-6 text-center">Loading pending orders…</p>
                                ) : dashboardMetrics.pendingOrdersList.length === 0 ? (
                                    <div className="py-8 text-center space-y-2">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                                        <p className="text-xs text-slate-500 font-medium">All current orders are fulfilled!</p>
                                        <p className="text-[11px] text-slate-400">Click &quot;Create Order&quot; below to generate a new live delivery.</p>
                                    </div>
                                ) : (
                                    dashboardMetrics.pendingOrdersList.slice(0, 4).map((del, idx) => (
                                        <div key={del.id || idx} className="py-3 flex justify-between items-center text-xs">
                                            <div>
                        <span className="font-mono text-[11px] font-semibold text-slate-900 block">
                          #{del.orderCode || del.deliveryCode || del.id?.slice(0, 8)}
                        </span>
                                                <span className="text-[11px] text-slate-500 block mt-0.5">
                          {del.deliveryAddress || del.address || del.recipientName || "Standard Delivery"}
                        </span>
                                            </div>
                                            <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/50">
                          {del.status || "PROCESSING"}
                        </span>
                                                <span className="text-slate-400 block text-[10px] mt-1">
                          {del.createdAt
                              ? new Date(del.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                              : "Today"}
                        </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Inventory Catalog Overview */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                                    <h2 className="text-sm font-bold text-slate-900">Inventory Catalog Overview</h2>
                                </div>
                                <Link href="/pharmacy/inventory" className="text-xs text-blue-600 hover:underline font-semibold">
                                    View Inventory
                                </Link>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {loading ? (
                                    <p className="text-xs text-slate-400 py-6 text-center">Loading catalog…</p>
                                ) : catalogDisplayList.length === 0 ? (
                                    <p className="text-xs text-slate-400 py-6 text-center">No catalog items available.</p>
                                ) : (
                                    catalogDisplayList.slice(0, 4).map((item, idx) => (
                                        <div key={item.id || idx} className="py-3 flex justify-between items-center text-xs">
                                            <div>
                        <span className="font-semibold text-slate-800 block">
                          {item.name || item.medicineName || "Medicine Item"}
                        </span>
                                                <span className="text-[11px] text-slate-400 block mt-0.5">{item.category || "General"}</span>
                                            </div>
                                            <div className="text-right">
                        <span className="font-bold text-slate-800 block">
                          {item.quantity ?? item.stock ?? 0} in stock
                        </span>
                                                <span
                                                    className={`block text-[10px] font-semibold mt-0.5 ${
                                                        (item.quantity ?? item.stock ?? 0) > 0 ? "text-emerald-600" : "text-rose-500"
                                                    }`}
                                                >
                          {(item.quantity ?? item.stock ?? 0) > 0 ? "Available" : "Out of Stock"}
                        </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                        <Link
                            href="/pharmacy/medicines/new"
                            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 shadow-sm transition"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Medicine
                        </Link>
                        <button
                            type="button"
                            onClick={() => void handleCreateTestOrder()}
                            disabled={creatingOrder || !pharmacyId}
                            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 shadow-sm transition disabled:opacity-50"
                        >
                            {creatingOrder ? (
                                <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Creating Order...
                                </>
                            ) : (
                                <>
                                    <ClipboardList className="w-3.5 h-3.5" /> Create Order
                                </>
                            )}
                        </button>
                        <Link
                            href="/pharmacy/inventory"
                            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 shadow-sm transition"
                        >
                            <Boxes className="w-3.5 h-3.5" /> View Inventory
                        </Link>
                    </div>
                </main>
            </div>
        </div>
    );
}