"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clearAuthData } from "@/lib/auth";

const NAV_ITEMS = [
    { href: "/pharmacy/dashboard", label: "Pharmacy Dashboard", icon: "▦" },
    { href: "/pharmacy/prescriptions", label: "Prescription", icon: "📋" },
    { href: "/pharmacy/orders", label: "Order Management", icon: "🧾" },
    { href: "/pharmacy/inventory", label: "Medicine Inventory", icon: "💊" },
    { href: "/pharmacy/medicines/new", label: "Add/ Edit Medicine", icon: "➕" },
    { href: "/pharmacy/inventory/low-stock", label: "Low Stock Alerts", icon: "⚠️" },
    { href: "/pharmacy/inventory/expiry", label: "Expiry Management", icon: "📅" },
    { href: "/pharmacy/deliveries", label: "Deliveries", icon: "🚚" },
    { href: "/pharmacy/reports", label: "Reports", icon: "📊" },
];

export default function PharmacySidebar() {
    const pathname = usePathname();

    return (
        <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
            <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white">
                    <span aria-hidden>👤</span>
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-900">Health Bridge</p>
                    <p className="text-xs text-slate-400">Clinician Portal</p>
                </div>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                {NAV_ITEMS.map((item) => {
                    const active = pathname === item.href || pathname?.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                                active
                                    ? "border-l-2 border-blue-600 bg-blue-50 text-blue-700"
                                    : "text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            <span aria-hidden>{item.icon}</span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="space-y-1 border-t border-slate-100 px-3 py-4">
                <Link href="/notifications" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                    🔔 Notifications
                </Link>
                <Link href="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                    ⚙️ Settings
                </Link>
                <button
                    onClick={() => {
                        clearAuthData();
                        window.location.href = "/login";
                    }}
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 text-left transition-colors cursor-pointer"
                >
                    ⏻ Logout
                </button>
            </div>
        </aside>
    );
}