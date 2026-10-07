// src/app/pharmacy/medicines/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Sidebar } from "@/components/ui/Sidebar";
import { getMedicineById } from "@/services/pharmacyService";
import type { Medicine } from "@/types/pharmacy";
import MedicineForm from "@/components/pharmacy/MedicineForm";

// MedicineForm හි dynamic props mismatch විසඳීම සඳහා:
const FormComponent = MedicineForm as React.ComponentType<{
    mode?: string;
    initialMedicine?: Medicine | null;
    initialData?: Medicine | null;
    medicine?: Medicine | null;
}>;

export default function EditMedicinePage() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const params = useParams();
    const rawId = params?.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    const [medicine, setMedicine] = useState<Medicine | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function load() {
            if (!id) return;
            try {
                if (isMounted) {
                    setLoading(true);
                    setError(null);
                }
                const data = await getMedicineById(id);
                if (isMounted) setMedicine(data);
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : "Failed to load medicine");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        void load();

        return () => {
            isMounted = false;
        };
    }, [id]);

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
                        <h1 className="mb-1 text-2xl font-semibold text-slate-900">Add/Edit Medicine</h1>
                        <p className="mb-6 text-sm text-slate-500">Create, update, and manage medicine records</p>
                    </div>

                    {loading ? (
                        <p className="text-sm text-slate-400">Loading…</p>
                    ) : error || !medicine ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {error ?? "Medicine not found"}
                        </div>
                    ) : (
                        <FormComponent
                            mode="edit"
                            initialMedicine={medicine}
                            initialData={medicine}
                            medicine={medicine}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}