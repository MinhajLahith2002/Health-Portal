"use client";

import React from "react";
import Link from "next/link";
import { useHospital } from "@/context/HospitalContext";
import {
  Plus, FileText, CheckCircle, Clock, XCircle, Eye, Trash2, Shield, AlertCircle,
} from "lucide-react";
import DashboardLayout from "@/app/dashboard/layout";

export default function CompliancePage() {
  const {
    complianceReports,
    complianceLoading,
    complianceError,
    deleteComplianceReport,
  } = useHospital();

  if (complianceLoading) {
    return (
      <DashboardLayout pageTitle="Compliance Reports">
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-500">Loading compliance reports...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (complianceError) {
    return (
      <DashboardLayout pageTitle="Compliance Reports">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <p className="font-medium">❌ Error loading compliance reports</p>
          <p className="text-sm mt-1">{complianceError}</p>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'IN_PROGRESS': return <AlertCircle className="w-4 h-4" />;
      case 'REJECTED': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <DashboardLayout pageTitle="Compliance Reports">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Compliance Reports</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage regulatory and operational compliance reports
          </p>
        </div>
        {/* ✅ FIXED: Changed link from /hospital/billing/compliance/create to /hospital/compliance/create */}
        <Link
          href="/hospital/compliance/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" /> New Report
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium uppercase">Total</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{complianceReports.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium uppercase">Completed</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {complianceReports.filter((r) => r.status?.toUpperCase() === "COMPLETED").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium uppercase">In Progress</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {complianceReports.filter((r) => r.status?.toUpperCase() === "IN_PROGRESS").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium uppercase">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {complianceReports.filter((r) => r.status?.toUpperCase() === "PENDING").length}
          </p>
        </div>
      </div>

      {complianceReports.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No compliance reports</h3>
          <p className="text-sm text-slate-500 mt-1">Create your first compliance report to get started.</p>
          <Link
            href="/hospital/compliance/create"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl"
          >
            <Plus className="w-4 h-4" /> Create Report
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complianceReports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">
                      {report.reportType || "Compliance Report"}
                    </h3>
                    <p className="text-xs text-slate-500">Period: {report.period || "N/A"}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full border flex items-center gap-1 ${getStatusColor(report.status)}`}>
                  {getStatusIcon(report.status)}
                  {report.status || "DRAFT"}
                </span>
              </div>

              <p className="mt-3 text-sm text-slate-600 line-clamp-2">
                {report.summary || "No summary provided"}
              </p>

              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                {/* ✅ FIXED: Changed to /hospital/compliance/:id */}
                <Link
                  href={`/hospital/compliance/${report.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </Link>
                <button
                  onClick={() => deleteComplianceReport(report.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}