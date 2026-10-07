"use client";

import React, { useState } from "react";
import { ComplianceReportRequest } from "@/types/hospital";
import HospitalSelect from "@/components/forms/HospitalSelect";
import { Shield } from "lucide-react";

interface ComplianceReportFormProps {
  initialData?: Partial<ComplianceReportRequest>;
  onSubmit: (data: ComplianceReportRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ComplianceReportForm: React.FC<ComplianceReportFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<ComplianceReportRequest>({
    hospitalId: initialData?.hospitalId || "",
    reportType: initialData?.reportType || "",
    period: initialData?.period || "",
    status: initialData?.status || "PENDING",
    summary: initialData?.summary || "",
    preparedBy: initialData?.preparedBy || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.hospitalId?.trim()) {
      newErrors.hospitalId = "Hospital is required";
    }
    if (!formData.reportType?.trim()) {
      newErrors.reportType = "Report type is required";
    }
    if (!formData.period?.trim()) {
      newErrors.period = "Period is required";
    }
    if (!formData.preparedBy?.trim()) {
      newErrors.preparedBy = "Prepared by is required";
    }
    if (!formData.summary?.trim()) {
      newErrors.summary = "Summary is required";
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

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
      {/* REPORT DETAILS */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
          Report Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Report Type <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="reportType"
              value={formData.reportType}
              onChange={handleChange}
              required
              placeholder="REGULATORY, FINANCIAL, OPERATIONAL..."
              className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition ${
                errors.reportType ? "border-red-500 border-2" : "border-slate-200"
              }`}
            />
            {errors.reportType && (
              <p className="mt-1 text-xs text-red-600">{errors.reportType}</p>
            )}
          </div>

          {/* Period */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Period <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="period"
              value={formData.period}
              onChange={handleChange}
              required
              placeholder="Q3-2026, August-2026..."
              className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition ${
                errors.period ? "border-red-500 border-2" : "border-slate-200"
              }`}
            />
            {errors.period && (
              <p className="mt-1 text-xs text-red-600">{errors.period}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition bg-white"
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          {/* Prepared By */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Prepared By <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="preparedBy"
              value={formData.preparedBy}
              onChange={handleChange}
              required
              placeholder="Dr. Sarah Perera"
              className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition ${
                errors.preparedBy ? "border-red-500 border-2" : "border-slate-200"
              }`}
            />
            {errors.preparedBy && (
              <p className="mt-1 text-xs text-red-600">{errors.preparedBy}</p>
            )}
          </div>

          {/* Summary */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              rows={4}
              required
              placeholder="Provide a summary of the compliance report..."
              className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition ${
                errors.summary ? "border-red-500 border-2" : "border-slate-200"
              }`}
            />
            {errors.summary && (
              <p className="mt-1 text-xs text-red-600">{errors.summary}</p>
            )}
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
            <>
              <Shield className="w-4 h-4" />
              Create Report
            </>
          )}
        </button>
      </div>
    </form>
  );
};