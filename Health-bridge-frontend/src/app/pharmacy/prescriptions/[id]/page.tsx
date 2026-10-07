// src/app/pharmacy/prescriptions/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Receipt, AlertCircle, Sparkles } from "lucide-react";
import { prescriptionService } from "@/services/prescriptionService";
import { getAllMedicines } from "@/services/pharmacyService";
import { prescriptionBillingService, DispensedPrescriptionBill } from "@/services/prescriptionBillingService";
import api from "@/lib/axios";
import type { Prescription } from "@/types/prescription";

const STATUS_STYLES: Record<string, string> = {
    ACTIVE: "bg-blue-50 text-blue-700 border border-blue-200",
    active: "bg-blue-50 text-blue-700 border border-blue-200",
    COMPLETED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    CANCELLED: "bg-red-50 text-red-600 border border-red-200",
    cancelled: "bg-red-50 text-red-600 border border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
    ACTIVE: "Active",
    active: "Active",
    COMPLETED: "Dispensed",
    completed: "Dispensed",
    CANCELLED: "Cancelled",
    cancelled: "Cancelled",
};

export default function PrescriptionDetailPage() {
    const params = useParams();
    const rawId = params?.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const router = useRouter();

    const [prescription, setPrescription] = useState<Prescription | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [dispensedMessage, setDispensedMessage] = useState<string | null>(null);
    const [generatedBill, setGeneratedBill] = useState<DispensedPrescriptionBill | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            if (!id) return;
            try {
                setLoading(true);
                const data = await prescriptionService.getPrescriptionById(id);
                if (!cancelled) {
                    setPrescription(data);
                    // Check if already dispensed in local bills
                    const existingBills = prescriptionBillingService.getAllDispensedBills();
                    const matchedBill = existingBills.find((b) => b.id === data.id);
                    if (matchedBill) {
                        setGeneratedBill(matchedBill);
                    }
                }
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load prescription");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void load();
        return () => {
            cancelled = true;
        };
    }, [id]);

    async function handleDownload() {
        if (!prescription) return;
        try {
            setDownloading(true);
            const blob = await prescriptionService.downloadPrescription(prescription.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${prescription.prescriptionNumber}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Download failed");
        } finally {
            setDownloading(false);
        }
    }

    async function handleVerifyAndDispense() {
        if (!prescription) return;
        setActionError(null);
        setUpdating(true);
        try {
            // 1. Fetch available medicines to get current unit prices
            let medicinesList: any[] = [];
            try {
                const res = await getAllMedicines();
                medicinesList = Array.isArray(res) ? res : ((res as any)?.data || []);
            } catch (medErr) {
                console.warn("Could not fetch medicine catalog prices:", medErr);
            }

            // 2. Build and persist dispensed medical bill for the right patient
            const bill = prescriptionBillingService.buildBill(prescription, medicinesList);
            prescriptionBillingService.saveDispensedBill(bill);
            setGeneratedBill(bill);

            // 3. Update prescription status in backend to COMPLETED
            try {
                await prescriptionService.updatePrescription(prescription.id, {
                    status: "COMPLETED",
                } as unknown as Parameters<typeof prescriptionService.updatePrescription>[1]);
            } catch (updateErr) {
                console.warn("Backend prescription status update warn:", updateErr);
            }

            // 4. Also trigger backend invoice creation if endpoint is available
            api.post(`/hospital-billing/invoices/from-prescription/${prescription.id}`).catch(() => {
                // Ignore if cross-module invoice endpoint is not active
            });

            // 5. Refresh prescription state
            try {
                const refreshed = await prescriptionService.getPrescriptionById(prescription.id);
                setPrescription(refreshed);
            } catch {
                setPrescription((prev) => (prev ? { ...prev, status: "COMPLETED" } : null));
            }

            setDispensedMessage(
                `Prescription verified and dispensed! Medication details (${bill.items.length} items) have been sent to the Medical Prescription Bills section in Payments for patient "${prescription.patientName}" (Patient ID: ${prescription.patientId}).`
            );
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Failed to verify and dispense prescription");
        } finally {
            setUpdating(false);
        }
    }

    async function handleReject() {
        if (!prescription) return;
        setActionError(null);
        setUpdating(true);
        try {
            await prescriptionService.updatePrescription(prescription.id, {
                status: "CANCELLED",
            } as unknown as Parameters<typeof prescriptionService.updatePrescription>[1]);

            const refreshed = await prescriptionService.getPrescriptionById(prescription.id);
            setPrescription(refreshed);
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Reject failed");
        } finally {
            setUpdating(false);
        }
    }

    if (loading) {
        return (
            <div className="p-6 text-sm text-slate-400 flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                Loading prescription…
            </div>
        );
    }

    if (error || !prescription) {
        return (
            <div className="m-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Couldn&apos;t load prescription: {error ?? "Not found"}
            </div>
        );
    }

    const currentStatus = (prescription.status || "ACTIVE").toUpperCase();
    const isDispensed = currentStatus === "COMPLETED" || currentStatus === "DISPENSED";
    const isActive = currentStatus === "ACTIVE";

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="mb-1 text-xs text-slate-500 hover:text-slate-700"
                    >
                        ← Back to queue
                    </button>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Prescription Verification & Dispensing</h1>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[currentStatus] || STATUS_STYLES.ACTIVE}`}>
                    {STATUS_LABELS[currentStatus] || currentStatus}
                </span>
            </div>

            {/* Dispense Success Alert */}
            {dispensedMessage && (
                <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/90 p-5 shadow-sm text-emerald-900 animate-in fade-in">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-emerald-950">Medications Dispensed & Billed Successfully</h3>
                                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">{dispensedMessage}</p>
                                {generatedBill && (
                                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-900 bg-emerald-100/70 px-3.5 py-2 rounded-xl border border-emerald-200">
                                        <span>Patient: <strong className="font-bold">{generatedBill.patientName}</strong></span>
                                        <span>Patient ID: <strong className="font-bold">{generatedBill.patientId}</strong></span>
                                        <span>Total Fee: <strong className="font-bold">RS {generatedBill.totalAmount.toLocaleString()}</strong></span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Link
                            href="/payments"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition shrink-0"
                        >
                            <span>Go to Patient Payments</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            )}

            {actionError && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{actionError}</span>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200/80 lg:col-span-2">
                    <h2 className="mb-4 text-sm font-semibold text-slate-900">Prescription Details</h2>

                    <div className="mb-5 flex items-center gap-3 rounded-lg bg-slate-50 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                            {(prescription.patientName || "PT")
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                        </div>
                        <div>
                            <p className="font-medium text-slate-900 text-sm">{prescription.patientName}</p>
                            <p className="text-xs text-slate-500">
                                Patient ID: {prescription.patientId} &middot; Phone: {prescription.patientPhone || "N/A"}
                            </p>
                        </div>
                    </div>

                    <div className="mb-6 grid grid-cols-2 gap-4 text-xs sm:grid-cols-3">
                        <Field label="Rx ID" value={prescription.prescriptionNumber || prescription.id} />
                        <Field label="Prescribing Doctor" value={prescription.doctorName || "Staff Physician"} />
                        <Field
                            label="Issue Date"
                            value={new Date((prescription as any).date || prescription.createdAt || Date.now()).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })}
                        />
                        <Field
                            label="Valid Until"
                            value={prescription.validUntil ? new Date(prescription.validUntil).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            }) : "N/A"}
                        />
                        <Field
                            label="Billing Target"
                            value={`Patient: ${prescription.patientName} (${prescription.patientId})`}
                        />
                    </div>

                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Prescribed Medications ({prescription.items?.length || 0})
                        </h3>
                        <Link
                            href="/pharmacy/medicines/new"
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
                            target="_blank"
                        >
                            <span>Check Medicine Catalog & Pricing</span>
                            <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-slate-100">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                            <tr>
                                <th className="px-4 py-2.5 font-medium">Drug Name</th>
                                <th className="px-4 py-2.5 font-medium">Dosage</th>
                                <th className="px-4 py-2.5 font-medium">Frequency</th>
                                <th className="px-4 py-2.5 font-medium">Duration</th>
                                <th className="px-4 py-2.5 font-medium text-right">QTY</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-600">
                            {(prescription.items || []).map((item, idx) => (
                                <tr key={item.id || idx}>
                                    <td className="px-4 py-2.5 font-bold text-slate-900">{item.medicineName}</td>
                                    <td className="px-4 py-2.5">{item.dosage}</td>
                                    <td className="px-4 py-2.5">{item.frequency}</td>
                                    <td className="px-4 py-2.5">{item.duration}</td>
                                    <td className="px-4 py-2.5 text-right font-black text-blue-700 bg-blue-50/30">
                                        {item.quantity}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {prescription.notes && (
                        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                            <span className="font-medium text-slate-700">Notes: </span>
                            {prescription.notes}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="rounded-xl bg-white p-5 text-center shadow-sm border border-slate-200/80">
                        <p className="mb-3 text-2xl" aria-hidden>📷</p>
                        <p className="mb-3 text-xs font-medium text-slate-700">Scan QR to verify</p>
                        <input
                            type="text"
                            placeholder="Enter Rx ID manually"
                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-blue-400"
                        />
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-200/80">
                        <h3 className="mb-1 text-sm font-semibold text-slate-900">Dispense & Billing Actions</h3>
                        <p className="mb-3 text-xs text-slate-400">
                            Verify prescription and dispense medicines to forward bill to patient payment portal.
                        </p>
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => void handleDownload()}
                                disabled={downloading}
                                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
                            >
                                {downloading ? "Downloading…" : "Download prescription"}
                            </button>

                            {isDispensed ? (
                                <button
                                    type="button"
                                    disabled
                                    className="w-full rounded-lg bg-emerald-100 border border-emerald-300 px-4 py-2 text-xs font-bold text-emerald-800 cursor-not-allowed flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>Dispensed & Forwarded to Patient Bill</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => void handleVerifyAndDispense()}
                                    disabled={updating || !isActive}
                                    className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 transition shadow-sm hover:shadow"
                                >
                                    {updating ? "Processing & Dispensing…" : "Verify and dispense"}
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => void handleReject()}
                                disabled={updating || !isActive}
                                className="w-full rounded-lg border border-red-200 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 transition"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[11px] text-slate-400">{label}</p>
            <p className="font-medium text-slate-800 text-xs mt-0.5">{value}</p>
        </div>
    );
}