"use client";

import React from "react";
import Link from "next/link";
import { Invoice } from "@/types/hospital";
import { Eye, Edit, Trash2, FileText } from "lucide-react";
import { formatLKR } from "@/lib/currency";

interface InvoiceCardProps {
  invoice: Invoice;
  onDelete: (id: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PAID':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'DRAFT':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'ISSUED':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'PAID':
      return 'bg-emerald-100 text-emerald-700';
    case 'UNPAID':
      return 'bg-red-100 text-red-700';
    case 'PARTIAL':
      return 'bg-yellow-100 text-yellow-700';
    case 'REFUNDED':
      return 'bg-purple-100 text-purple-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

export const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice, onDelete }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition p-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">
              {invoice.invoiceNumber}
            </h3>
            <p className="text-xs text-slate-500">{invoice.patientName}</p>
          </div>
        </div>
        {/* ✅ LKR Total */}
        <span className="text-base font-bold text-slate-900">
          {formatLKR(invoice.total)}
        </span>
      </div>

      {/* Status Badges */}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(invoice.status)}`}>
          {invoice.status}
        </span>
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(invoice.paymentStatus)}`}>
          {invoice.paymentStatus}
        </span>
      </div>

      {/* Details - ✅ LKR Balance */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>{new Date(invoice.issueDate).toLocaleDateString()}</span>
        <span>Balance: {formatLKR(invoice.balance)}</span>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
        <Link
          href={`/hospital/billing/invoices/${invoice.id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </Link>
        <Link
          href={`/hospital/billing/invoices/${invoice.id}/edit`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition"
        >
          <Edit className="w-3.5 h-3.5" />
          Edit
        </Link>
        <button
          onClick={() => onDelete(invoice.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition ml-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
};