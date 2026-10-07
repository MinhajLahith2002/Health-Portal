// src/components/pharmacy/MedicineForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, AlertCircle, RefreshCw, Save } from "lucide-react";
import { usePharmacyId } from "@/hooks/usePharmacyId";
import {
    getAllMedicines,
    createMedicine,
    updateMedicine,
    addStock,
} from "@/services/pharmacyService";
import type { Medicine } from "@/types/pharmacy";

interface MedicineFormProps {
    mode?: "add" | "edit";
    initialMedicine?: Medicine;
}

export default function AddEditMedicinePage({ mode: initialMode = "add", initialMedicine }: MedicineFormProps = {}) {
    const router = useRouter();
    const { pharmacyId } = usePharmacyId();

    const [mode, setMode] = useState<"add" | "edit">(initialMode);
    const [existingMedicines, setExistingMedicines] = useState<Medicine[]>([]);
    const [selectedMedicineId, setSelectedMedicineId] = useState<string>("");
    const [loadingList, setLoadingList] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        genericName: "",
        brandName: "",
        medicineCode: "",
        category: "",
        dosageForm: "",
        strength: "",
        manufacturer: "",
        unitPrice: "",
        description: "",
        batchNumber: "",
        purchasePrice: "",
        sellingPrice: "",
        currentStock: "",
        reorderLevel: "",
        supplier: "",
        isActive: true,
        prescriptionRequired: false,
        controlledDrug: false,
        isTaxable: true,
        requiresColdStorage: false,
    });

    // Load Existing Medicines for Edit Tab
    useEffect(() => {
        let isMounted = true;

        async function fetchMedicines() {
            try {
                if (isMounted) setLoadingList(true);
                const res = await getAllMedicines();
                if (!isMounted) return;

                const list = Array.isArray(res) ? res : ((res as unknown as { data?: Medicine[] })?.data || []);
                setExistingMedicines(list);
            } catch (err) {
                console.error("Failed to load medicines:", err);
            } finally {
                if (isMounted) setLoadingList(false);
            }
        }

        void fetchMedicines();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleRefreshList = async () => {
        try {
            setLoadingList(true);
            const res = await getAllMedicines();
            const list = Array.isArray(res) ? res : ((res as unknown as { data?: Medicine[] })?.data || []);
            setExistingMedicines(list);
        } catch (err) {
            console.error("Failed to refresh medicines:", err);
        } finally {
            setLoadingList(false);
        }
    };

    // When a medicine is selected in Edit mode, auto-fill the form
    const handleSelectMedicineToEdit = (medId: string) => {
        setSelectedMedicineId(medId);
        const med = existingMedicines.find((m) => m.id === medId);
        if (!med) return;

        const rawMed = med as unknown as Record<string, unknown>;

        setFormData({
            name: med.name || "",
            genericName: String(rawMed.genericName || med.name || ""),
            brandName: String(rawMed.brandName || med.manufacturer || ""),
            medicineCode: String(rawMed.medicineCode || rawMed.code || med.id || ""),
            category: med.category || "General",
            dosageForm: String(rawMed.dosageForm || "Tablet"),
            strength: med.strength || "",
            manufacturer: med.manufacturer || "",
            unitPrice: String(med.unitPrice ?? ""),
            description: String(rawMed.description || ""),
            batchNumber: "",
            purchasePrice: String(med.unitPrice ? (Number(med.unitPrice) * 0.8).toFixed(2) : ""),
            sellingPrice: String(med.unitPrice ?? ""),
            currentStock: "100",
            reorderLevel: "20",
            supplier: med.manufacturer || "State Pharmaceuticals",
            isActive: true,
            prescriptionRequired: Boolean(rawMed.prescriptionRequired || rawMed.requiresPrescription),
            controlledDrug: Boolean(rawMed.controlledDrug || rawMed.isControlled),
            isTaxable: true,
            requiresColdStorage: false,
        });
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setFormData({
            name: "",
            genericName: "",
            brandName: "",
            medicineCode: "",
            category: "",
            dosageForm: "",
            strength: "",
            manufacturer: "",
            unitPrice: "",
            description: "",
            batchNumber: "",
            purchasePrice: "",
            sellingPrice: "",
            currentStock: "",
            reorderLevel: "",
            supplier: "",
            isActive: true,
            prescriptionRequired: false,
            controlledDrug: false,
            isTaxable: true,
            requiresColdStorage: false,
        });
        setSelectedMedicineId("");
    };

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!formData.name.trim()) {
            setMessage({ type: "error", text: "Medicine Name is required" });
            return;
        }

        try {
            setSubmitting(true);

            // Medicine type එකට අදාළ අනිවාර්ය properties සියල්ලම ඇතුළත් කිරීම
            const medicinePayload: Omit<Medicine, "id"> = {
                name: formData.name.trim(),
                medicineCode: formData.medicineCode.trim() || `MED-${Date.now().toString().slice(-5)}`,
                category: formData.category.trim() || "General",
                manufacturer: formData.manufacturer.trim() || formData.brandName.trim() || "General Pharma",
                strength: formData.strength.trim() || "N/A",
                unitPrice: Number(formData.unitPrice || formData.sellingPrice) || 0,
                prescriptionRequired: formData.prescriptionRequired,
                controlledDrug: formData.controlledDrug,
            } as unknown as Omit<Medicine, "id">;

            let savedMedId = selectedMedicineId;

            if (mode === "add") {
                const created = await createMedicine(medicinePayload);
                const createdData = (created as unknown as { data?: Medicine })?.data || created;
                savedMedId = createdData.id;
            } else {
                await updateMedicine(selectedMedicineId, medicinePayload);
            }

            // Add Stock if pharmacy is active and stock quantity is specified
            if (pharmacyId && Number(formData.currentStock) > 0) {
                await addStock({
                    pharmacyId,
                    medicineId: savedMedId,
                    quantity: Number(formData.currentStock),
                    batchNumber: formData.batchNumber.trim() || `BAT-${Date.now().toString().slice(-4)}`,
                    expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
                }).catch((err) => console.warn("Stock auto-add warning:", err));
            }

            setMessage({
                type: "success",
                text: `Medicine successfully ${mode === "add" ? "added" : "updated"}!`,
            });

            await handleRefreshList();
            if (mode === "add") resetForm();
        } catch (err) {
            console.error("Save error:", err);
            setMessage({
                type: "error",
                text: err instanceof Error ? err.message : "Failed to save medicine record",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const inputStyle =
        "w-full px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition";

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
            <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Add/Edit Medicine</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                    Create, update, and manage medicine records and stock levels.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 text-xs font-semibold gap-6">
                <button
                    type="button"
                    onClick={() => {
                        setMode("add");
                        resetForm();
                    }}
                    className={`pb-2.5 transition-all ${
                        mode === "add"
                            ? "text-blue-600 border-b-2 border-blue-600 font-bold"
                            : "text-slate-400 hover:text-slate-700"
                    }`}
                >
                    Add Medicine
                </button>
                <button
                    type="button"
                    onClick={() => setMode("edit")}
                    className={`pb-2.5 transition-all ${
                        mode === "edit"
                            ? "text-blue-600 border-b-2 border-blue-600 font-bold"
                            : "text-slate-400 hover:text-slate-700"
                    }`}
                >
                    Edit Medicine
                </button>
            </div>

            {message && (
                <div
                    className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border shadow-sm ${
                        message.type === "success"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-700 border-red-200"
                    }`}
                >
                    {message.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {message.text}
                </div>
            )}

            {/* Edit Mode: Medicine Selector */}
            {mode === "edit" && (
                <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 space-y-3">
                    <label className="block text-xs font-semibold text-slate-700">
                        Select Existing Medicine to Edit
                    </label>
                    <div className="flex gap-2">
                        <select
                            value={selectedMedicineId}
                            onChange={(e) => handleSelectMedicineToEdit(e.target.value)}
                            className={`${inputStyle} flex-1`}
                            disabled={loadingList}
                        >
                            <option value="">-- Choose a medicine --</option>
                            {existingMedicines.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name} ({m.category || "General"}) — ${m.unitPrice}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() => void handleRefreshList()}
                            className="px-3.5 py-2.5 border border-slate-200 bg-white rounded-xl text-slate-600 hover:bg-slate-50 transition"
                            title="Refresh list"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? "animate-spin" : ""}`} />
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left 2 Columns */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Medicine Details */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
                        <div className="border-b border-slate-100 pb-3">
                            <h2 className="text-sm font-bold text-slate-900">Medicine Details</h2>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Basic identification and descriptive information.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">
                                    Medicine Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    placeholder="e.g. Paracetamol"
                                    className={inputStyle}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">
                                    Generic Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.genericName}
                                    onChange={(e) => handleInputChange("genericName", e.target.value)}
                                    placeholder="e.g. Acetaminophen"
                                    className={inputStyle}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Brand Name</label>
                                <input
                                    type="text"
                                    value={formData.brandName}
                                    onChange={(e) => handleInputChange("brandName", e.target.value)}
                                    placeholder="e.g. Panadol"
                                    className={inputStyle}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">
                                    Medicine ID / SKU
                                </label>
                                <input
                                    type="text"
                                    value={formData.medicineCode}
                                    onChange={(e) => handleInputChange("medicineCode", e.target.value)}
                                    placeholder="e.g. MED-00123"
                                    className={inputStyle}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={(e) => handleInputChange("category", e.target.value)}
                                    placeholder="e.g. Analgesic, Antibiotic"
                                    className={inputStyle}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Dosage Form</label>
                                <input
                                    type="text"
                                    value={formData.dosageForm}
                                    onChange={(e) => handleInputChange("dosageForm", e.target.value)}
                                    placeholder="e.g. Tablet, Syrup, Injection"
                                    className={inputStyle}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Strength</label>
                                <input
                                    type="text"
                                    value={formData.strength}
                                    onChange={(e) => handleInputChange("strength", e.target.value)}
                                    placeholder="e.g. 500mg, 10ml"
                                    className={inputStyle}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Manufacturer</label>
                                <input
                                    type="text"
                                    value={formData.manufacturer}
                                    onChange={(e) => handleInputChange("manufacturer", e.target.value)}
                                    placeholder="e.g. Pfizer, GSK"
                                    className={inputStyle}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Unit Price ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.unitPrice}
                                    onChange={(e) => handleInputChange("unitPrice", e.target.value)}
                                    placeholder="0.00"
                                    className={inputStyle}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                            <textarea
                                rows={3}
                                value={formData.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                placeholder="Usage instructions, side effects, notes..."
                                className={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Inventory & Pricing */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
                        <div className="border-b border-slate-100 pb-3">
                            <h2 className="text-sm font-bold text-slate-900">Inventory & Pricing</h2>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Stock levels, batch numbers, and reorder alerts.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Batch Number</label>
                                <input
                                    type="text"
                                    value={formData.batchNumber}
                                    onChange={(e) => handleInputChange("batchNumber", e.target.value)}
                                    placeholder="e.g. BAT-2026-A"
                                    className={inputStyle}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Purchase Price ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.purchasePrice}
                                    onChange={(e) => handleInputChange("purchasePrice", e.target.value)}
                                    placeholder="0.00"
                                    className={inputStyle}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Selling Price ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.sellingPrice}
                                    onChange={(e) => handleInputChange("sellingPrice", e.target.value)}
                                    placeholder="0.00"
                                    className={inputStyle}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Current Stock</label>
                                <input
                                    type="number"
                                    value={formData.currentStock}
                                    onChange={(e) => handleInputChange("currentStock", e.target.value)}
                                    placeholder="0"
                                    className={inputStyle}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Reorder Level</label>
                                <input
                                    type="number"
                                    value={formData.reorderLevel}
                                    onChange={(e) => handleInputChange("reorderLevel", e.target.value)}
                                    placeholder="10"
                                    className={inputStyle}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Supplier</label>
                                <input
                                    type="text"
                                    value={formData.supplier}
                                    onChange={(e) => handleInputChange("supplier", e.target.value)}
                                    placeholder="e.g. PharmaCorp Logistics"
                                    className={inputStyle}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Safety & Controls */}
                <div className="space-y-6">
                    <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
                        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                            Safety & Controls
                        </h2>

                        <div className="space-y-3 text-xs">
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="font-medium text-slate-700">Active Status</span>
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => handleInputChange("isActive", e.target.checked)}
                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                />
                            </label>

                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="font-medium text-slate-700">Prescription Required</span>
                                <input
                                    type="checkbox"
                                    checked={formData.prescriptionRequired}
                                    onChange={(e) => handleInputChange("prescriptionRequired", e.target.checked)}
                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                />
                            </label>

                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="font-medium text-slate-700">Controlled Substance</span>
                                <input
                                    type="checkbox"
                                    checked={formData.controlledDrug}
                                    onChange={(e) => handleInputChange("controlledDrug", e.target.checked)}
                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                />
                            </label>

                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="font-medium text-slate-700">Taxable Item</span>
                                <input
                                    type="checkbox"
                                    checked={formData.isTaxable}
                                    onChange={(e) => handleInputChange("isTaxable", e.target.checked)}
                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                />
                            </label>

                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="font-medium text-slate-700">Cold Storage Required</span>
                                <input
                                    type="checkbox"
                                    checked={formData.requiresColdStorage}
                                    onChange={(e) => handleInputChange("requiresColdStorage", e.target.checked)}
                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Submit Actions */}
                    <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 space-y-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" /> {mode === "add" ? "Save New Medicine" : "Update Medicine"}
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push("/pharmacy/inventory")}
                            className="w-full py-2.5 px-4 border border-slate-200 bg-white text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
                        >
                            Cancel & Back to Inventory
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}