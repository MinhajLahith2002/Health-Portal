"use client";

import React, { useState } from "react";
import { HospitalInventoryRequest } from "@/types/hospital";
import HospitalSelect from "@/components/forms/HospitalSelect";

interface InventoryFormProps {
  initialData?: Partial<HospitalInventoryRequest>;
  onSubmit: (data: HospitalInventoryRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const InventoryForm: React.FC<InventoryFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<HospitalInventoryRequest>({
    hospitalId: initialData?.hospitalId || "",
    itemCode: initialData?.itemCode || "",
    itemName: initialData?.itemName || "",
    category: initialData?.category || "",
    quantity: initialData?.quantity || 0,
    reorderLevel: initialData?.reorderLevel || 0,
    unit: initialData?.unit || "",
    supplier: initialData?.supplier || "",
    expiryDate: initialData?.expiryDate || "",
    unitCost: initialData?.unitCost || 0,
    location: initialData?.location || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.hospitalId?.trim()) {
      newErrors.hospitalId = "Hospital is required";
    }
    if (!formData.itemCode?.trim()) {
      newErrors.itemCode = "Item code is required";
    }
    if (!formData.itemName?.trim()) {
      newErrors.itemName = "Item name is required";
    }
    if (!formData.category?.trim()) {
      newErrors.category = "Category is required";
    }
    if (!formData.unit?.trim()) {
      newErrors.unit = "Unit is required";
    }
    if (formData.unitCost === undefined || formData.unitCost === null || formData.unitCost < 0) {
      newErrors.unitCost = "Unit cost is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    await onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "reorderLevel" || name === "unitCost"
          ? parseFloat(value) || 0
          : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ============================================================ */}
      {/* HOSPITAL INFORMATION */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
          Hospital Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ✅ Hospital Select (Smart Dropdown) */}
          <div className="md:col-span-2">
            <HospitalSelect
              value={formData.hospitalId}
              onChange={(id) => {
                setFormData((prev) => ({ ...prev, hospitalId: id }));
                setErrors((prev) => ({ ...prev, hospitalId: "" }));
              }}
              required
            />
            {errors.hospitalId && (
              <p className="mt-1 text-xs text-red-600">{errors.hospitalId}</p>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ITEM INFORMATION */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
          Item Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Item Code */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Item Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="itemCode"
              value={formData.itemCode}
              onChange={handleChange}
              required
              placeholder="MED-001"
              className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition ${
                errors.itemCode ? "border-red-500 border-2" : "border-slate-200"
              }`}
            />
            {errors.itemCode && (
              <p className="mt-1 text-xs text-red-600">{errors.itemCode}</p>
            )}
          </div>

          {/* Item Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="itemName"
              value={formData.itemName}
              onChange={handleChange}
              required
              placeholder="Paracetamol 500mg"
              className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition ${
                errors.itemName ? "border-red-500 border-2" : "border-slate-200"
              }`}
            />
            {errors.itemName && (
              <p className="mt-1 text-xs text-red-600">{errors.itemName}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              placeholder="Medicine, Equipment, Supply..."
              className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition ${
                errors.category ? "border-red-500 border-2" : "border-slate-200"
              }`}
            />
            {errors.category && (
              <p className="mt-1 text-xs text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Unit */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Unit <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              required
              placeholder="tablets, pcs, kg, ml..."
              className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition ${
                errors.unit ? "border-red-500 border-2" : "border-slate-200"
              }`}
            />
            {errors.unit && (
              <p className="mt-1 text-xs text-red-600">{errors.unit}</p>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* STOCK DETAILS */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
          Stock Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="0"
              placeholder="0"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
            />
          </div>

          {/* Reorder Level */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Reorder Level <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="reorderLevel"
              value={formData.reorderLevel}
              onChange={handleChange}
              required
              min="0"
              placeholder="0"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
            />
          </div>

          {/* Unit Cost */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Unit Cost (Rs.) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium pointer-events-none">
                Rs.
              </span>
              <input
                type="number"
                name="unitCost"
                value={formData.unitCost}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                className={`w-full rounded-xl border pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition ${
                  errors.unitCost ? "border-red-500 border-2" : "border-slate-200"
                }`}
              />
            </div>
            {errors.unitCost && (
              <p className="mt-1 text-xs text-red-600">{errors.unitCost}</p>
            )}
            <p className="text-xs text-slate-400 mt-1">
              Enter price in Sri Lankan Rupees (LKR)
            </p>
          </div>

          {/* Supplier */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Supplier
            </label>
            <input
              type="text"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              placeholder="Supplier Name"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Expiry Date
            </label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Shelf A-1, Room 2, Storage..."
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="animate-spin">⏳</span>
              Saving...
            </>
          ) : (
            "Add Item"
          )}
        </button>
      </div>
    </form>
  );
};

export default InventoryForm;