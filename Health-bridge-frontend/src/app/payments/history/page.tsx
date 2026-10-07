"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/app/dashboard/layout";
import { getStoredUser, AuthUser } from "@/lib/auth";
import { paymentService, PaymentRecord } from "@/services/paymentService";
import {
  Receipt,
  CreditCard,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  ArrowUpDown,
  FileDown,
  RefreshCw,
} from "lucide-react";

export default function PaymentHistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);

  const fetchHistory = async (patientId: string) => {
    setLoading(true);
    try {
      const data = await paymentService.getPaymentsByPatient(patientId);
      setPayments(data);
    } catch (err) {
      console.error("Failed to load payment history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentUser = getStoredUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(currentUser);
    fetchHistory(currentUser.id);
  }, [router]);

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.maskedCardNumber && p.maskedCardNumber.includes(searchQuery));
    const matchesCategory = selectedCategory === "ALL" || p.category === selectedCategory;
    const matchesStatus = selectedStatus === "ALL" || p.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirmed
          </span>
        );
      case "PENDING_CONFIRMATION":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Pending OTP
          </span>
        );
      case "EXPIRED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <AlertCircle className="w-3.5 h-3.5" />
            Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            {status}
          </span>
        );
    }
  };

  return (
    <DashboardLayout pageTitle="Payment History & Receipts">
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Your Billing History</h1>
            <p className="text-sm text-slate-500 mt-1">
              View all electronic transactions, invoices, and confirmed receipts.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => user && fetchHistory(user.id)}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <Link
              href="/payments"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Make New Payment</span>
            </Link>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by description, reference ID, or card..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Categories</option>
              <option value="CONSULTATION">Doctor Consultation</option>
              <option value="LAB_TEST">Laboratory Test</option>
              <option value="X_RAY">X-Ray</option>
              <option value="CHECKUP">Medical Checkup</option>
              <option value="PRESCRIPTION">Medical Prescription Bills</option>
              <option value="OTHER">Medical Service</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PENDING_CONFIRMATION">Pending OTP</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>

        {/* Table of Records */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
              <div className="text-sm font-semibold text-slate-600">Loading your transactions...</div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No payment records found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                You haven&apos;t completed any payments matching the selected criteria yet.
              </p>
              <Link
                href="/payments"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-100 transition"
              >
                <PlusCircle className="w-4 h-4" />
                Make First Payment
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">Description / Ref</th>
                    <th className="py-3.5 px-6">Category</th>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">Card</th>
                    <th className="py-3.5 px-6">Amount</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{p.description}</div>
                        <div className="font-mono text-xs text-slate-400 mt-0.5">#{p.id}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600 font-medium">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-600">
                        {p.maskedCardNumber || "••••"}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900">
                        RS {Number(p.amount).toLocaleString()}
                      </td>
                      <td className="py-4 px-6">{getStatusBadge(p.status)}</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedReceipt(p)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Receipt Modal */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-scale-in">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                  <Receipt className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Payment Receipt</h3>
                <p className="text-xs text-slate-400">HealthBridge Electronic Transaction Document</p>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID</span>
                  <span className="font-mono font-bold text-slate-800">{selectedReceipt.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient Name</span>
                  <span className="font-semibold text-slate-900">{selectedReceipt.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Description</span>
                  <span className="font-semibold text-slate-900">{selectedReceipt.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Card</span>
                  <span className="font-mono text-slate-700">{selectedReceipt.maskedCardNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cardholder</span>
                  <span className="text-slate-700">{selectedReceipt.cardHolderName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Created At</span>
                  <span className="text-slate-700">
                    {selectedReceipt.createdAt ? new Date(selectedReceipt.createdAt).toLocaleString() : "—"}
                  </span>
                </div>
                {selectedReceipt.confirmedAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Confirmed At</span>
                    <span className="text-slate-700">
                      {new Date(selectedReceipt.confirmedAt).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-900">Status</span>
                  <div>{getStatusBadge(selectedReceipt.status)}</div>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-sm font-bold text-slate-900">Total Paid</span>
                  <span className="text-lg font-black text-blue-600">
                    RS {Number(selectedReceipt.amount).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <FileDown className="w-4 h-4" />
                  Print / Save
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
