'use client';

import React, { useState } from 'react';
import { InvoiceRequest } from '@/types/hospital';
import PatientSelect from '@/components/forms/PatientSelect';
import HospitalSelect from '@/components/forms/HospitalSelect';
import { formatLKR } from '@/lib/currency';

interface InvoiceFormProps {
  initialData?: Partial<InvoiceRequest>;
  onSubmit: (data: InvoiceRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<InvoiceRequest>({
    patientId: initialData?.patientId || '',
    patientName: initialData?.patientName || '',
    hospitalId: initialData?.hospitalId || '',
    issueDate: initialData?.issueDate || new Date().toISOString(),
    dueDate: initialData?.dueDate || '',
    subtotal: initialData?.subtotal ?? 0,
    discount: initialData?.discount ?? 0,
    tax: initialData?.tax ?? 0,
    paidAmount: initialData?.paidAmount ?? 0,
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = Number(formData.subtotal) || 0;
  const discount = Number(formData.discount) || 0;
  const tax = Number(formData.tax) || 0;
  const paidAmount = Number(formData.paidAmount) || 0;
  const previewTotal = Math.max(0, subtotal - discount + tax);
  const previewBalance = Math.max(0, previewTotal - paidAmount);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.patientId?.trim()) newErrors.patientId = 'Patient is required';
    if (!formData.patientName?.trim()) newErrors.patientName = 'Patient name is required';
    if (!formData.hospitalId?.trim()) newErrors.hospitalId = 'Hospital is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData: InvoiceRequest = {
      patientId: formData.patientId?.trim() || '',
      patientName: formData.patientName?.trim() || '',
      hospitalId: formData.hospitalId?.trim() || '',
      issueDate: formData.issueDate ? new Date(formData.issueDate).toISOString() : new Date().toISOString(),
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      subtotal: Number(formData.subtotal) || 0,
      discount: Number(formData.discount) || 0,
      tax: Number(formData.tax) || 0,
      paidAmount: Number(formData.paidAmount) || 0,
      notes: formData.notes?.trim() || '',
    };

    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error('Submit failed:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleDateChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value ? new Date(value).toISOString() : '',
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Patient & Hospital */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
          Patient Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <PatientSelect
              value={formData.patientId}
              onChange={(id, name) => {
                setFormData((prev) => ({ ...prev, patientId: id, patientName: name }));
                setErrors((prev) => ({ ...prev, patientId: '', patientName: '' }));
              }}
              required
            />
            {errors.patientId && (
              <p className="mt-1 text-xs text-red-600">{errors.patientId}</p>
            )}
          </div>
          <div>
            <HospitalSelect
              value={formData.hospitalId}
              onChange={(id) => {
                setFormData((prev) => ({ ...prev, hospitalId: id }));
                setErrors((prev) => ({ ...prev, hospitalId: '' }));
              }}
              required
            />
            {errors.hospitalId && (
              <p className="mt-1 text-xs text-red-600">{errors.hospitalId}</p>
            )}
          </div>
        </div>
      </div>

      {/* Dates */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
          Invoice Dates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Issue Date
            </label>
            <input
              type="datetime-local"
              value={formData.issueDate ? new Date(formData.issueDate).toISOString().slice(0, 16) : ''}
              onChange={(e) => handleDateChange('issueDate', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Due Date
            </label>
            <input
              type="datetime-local"
              value={formData.dueDate ? new Date(formData.dueDate).toISOString().slice(0, 16) : ''}
              onChange={(e) => handleDateChange('dueDate', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Financial */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
          Financial Details (LKR)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Subtotal (Rs.) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium pointer-events-none">
                Rs.
              </span>
              <input
                type="number"
                name="subtotal"
                value={formData.subtotal}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full rounded-xl border border-slate-200 pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Discount (Rs.)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium pointer-events-none">
                Rs.
              </span>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full rounded-xl border border-slate-200 pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tax (Rs.)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium pointer-events-none">
                Rs.
              </span>
              <input
                type="number"
                name="tax"
                value={formData.tax}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full rounded-xl border border-slate-200 pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Paid Amount (Rs.)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium pointer-events-none">
                Rs.
              </span>
              <input
                type="number"
                name="paidAmount"
                value={formData.paidAmount}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full rounded-xl border border-slate-200 pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
          <h4 className="text-sm font-bold text-slate-700 mb-3">📊 Live Preview</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium">{formatLKR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Discount</span>
              <span className="font-medium text-red-600">- {formatLKR(discount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tax</span>
              <span className="font-medium">+ {formatLKR(tax)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-blue-200">
              <span className="text-base font-bold text-slate-900">Total</span>
              <span className="text-lg font-bold text-blue-600">{formatLKR(previewTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Paid</span>
              <span className="font-medium text-emerald-600">{formatLKR(paidAmount)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-blue-200">
              <span className="text-base font-bold text-slate-900">Balance</span>
              <span className={`text-lg font-bold ${previewBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {formatLKR(previewBalance)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Additional notes..."
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition shadow-sm shadow-blue-500/20"
        >
          {isLoading ? (
            <>
              <span className="animate-spin">⏳</span>
              Saving...
            </>
          ) : (
            'Save Invoice'
          )}
        </button>
      </div>
    </form>
  );
};