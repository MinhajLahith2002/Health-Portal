"use client";

import React from "react";
import Link from "next/link";
import { useHospital } from "@/context/HospitalContext";
import { InvoiceCard } from "@/components/hospital/billing/InvoiceCard";
import { Plus, FileText, RefreshCw } from "lucide-react";
import DashboardLayout from "@/app/dashboard/layout";
import { formatLKR } from "@/lib/currency";

export default function BillingPage() {
  const {
    invoices,
    invoicesLoading,
    invoicesError,
    deleteInvoice,
    fetchAllInvoices,
  } = useHospital();

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    fetchAllInvoices();
  };

  if (invoicesLoading && invoices.length === 0) {
    return (
      <DashboardLayout pageTitle="">
        <div className="flex flex-col justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-500 font-medium">Loading invoices...</p>
          <button
            onClick={handleRefresh}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (invoicesError && invoices.length === 0) {
    return (
      <DashboardLayout pageTitle="">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="font-medium text-red-700">❌ Error loading invoices</p>
          <p className="text-sm text-red-600 mt-1">{invoicesError}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Billing Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage patient invoices and billing history
            <span className="ml-2 text-xs bg-slate-100 px-2 py-0.5 rounded-full">
              {invoices.length} invoices
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-3 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <Link
            href="/hospital/billing/invoices/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-sm shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            New Invoice
          </Link>
        </div>
      </div>

      {/* Stats Summary - ✅ LKR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Invoices</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{invoices.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Paid</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {invoices.filter((i) => i.paymentStatus === "PAID").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Unpaid</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {invoices.filter((i) => i.paymentStatus === "UNPAID").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Revenue</p>
          {/* ✅ LKR */}
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {formatLKR(invoices.reduce((sum, i) => sum + (i.total || 0), 0))}
          </p>
        </div>
      </div>

      {/* Invoices Grid */}
      {invoices.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No invoices found</h3>
          <p className="text-sm text-slate-500 mt-1">Create your first invoice to get started.</p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <Link
              href="/hospital/billing/invoices/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition"
            >
              <Plus className="w-4 h-4" />
              Create Invoice
            </Link>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {invoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onDelete={deleteInvoice}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}