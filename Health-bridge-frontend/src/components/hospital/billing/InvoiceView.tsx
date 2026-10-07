"use client";

import React from "react";
import { Invoice } from "@/types/hospital";
import { formatLKR } from "@/lib/currency";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  FileText,
  User,
  Building2,
  Calendar,
  DollarSign,
} from "lucide-react";

interface InvoiceViewProps {
  invoice: Invoice;
  printId?: string;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({
  invoice,
  printId = "invoice-print",
}) => {
  return (
    <div id={printId} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{invoice.invoiceNumber}</h2>
              <p className="text-blue-100 text-sm">
                Issued on{" "}
                {new Date(invoice.issueDate).toLocaleDateString("en-LK", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-100 uppercase tracking-wider">Total Amount</p>
            <p className="text-3xl font-bold mt-1">{formatLKR(invoice.total)}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={invoice.status} type="invoice" />
          <StatusBadge status={invoice.paymentStatus} type="payment" />
        </div>

        {/* Patient & Hospital Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-700">Patient Information</h3>
            </div>
            <p className="text-lg font-bold text-slate-900">{invoice.patientName}</p>
            <p className="text-sm text-slate-500">ID: {invoice.patientId}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-semibold text-slate-700">Hospital Information</h3>
            </div>
            <p className="text-lg font-bold text-slate-900">{invoice.hospitalId}</p>
            <p className="text-sm text-slate-500">Issued by HealthBridge</p>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <p className="text-xs text-slate-500 font-medium uppercase">Issue Date</p>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {new Date(invoice.issueDate).toLocaleString("en-LK")}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              <p className="text-xs text-slate-500 font-medium uppercase">Due Date</p>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {invoice.dueDate ? new Date(invoice.dueDate).toLocaleString("en-LK") : "No due date"}
            </p>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-700">Financial Summary</h3>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium text-slate-900">{formatLKR(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Discount</span>
              <span className="font-medium text-red-600">- {formatLKR(invoice.discount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tax</span>
              <span className="font-medium text-slate-900">+ {formatLKR(invoice.tax)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-slate-100">
              <span className="text-base font-bold text-slate-900">Total</span>
              <span className="text-lg font-bold text-blue-600">{formatLKR(invoice.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Paid Amount</span>
              <span className="font-medium text-emerald-600">{formatLKR(invoice.paidAmount)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-slate-100">
              <span className="text-base font-bold text-slate-900">Balance</span>
              <span
                className={`text-lg font-bold ${
                  invoice.balance > 0 ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {formatLKR(invoice.balance)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="p-4 rounded-xl border border-blue-100 bg-blue-50">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-blue-800">Notes</h3>
            </div>
            <p className="text-sm text-blue-700 leading-relaxed">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceView;