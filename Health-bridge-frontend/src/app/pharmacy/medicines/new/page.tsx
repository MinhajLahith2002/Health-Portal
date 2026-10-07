// src/app/pharmacy/medicines/new/page.tsx
"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/ui/Sidebar";
import MedicineForm from "@/components/pharmacy/MedicineForm";

// MedicineForm හි dynamic mode props compatibility සඳහා:
const FormComponent = MedicineForm as React.ComponentType<{
    mode?: string;
    initialMedicine?: unknown;
    initialData?: unknown;
}>;

export default function AddMedicinePage() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

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
                    <div>
                        <h1 className="mb-1 text-2xl font-semibold text-slate-900 tracking-tight">
                            Add New Medicine
                        </h1>
                        <p className="mb-6 text-sm text-slate-500">
                            Create and register new medicine records into the pharmacy catalog.
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
                        <FormComponent mode="add" />
                    </div>
                </main>
            </div>
        </div>
    );
}