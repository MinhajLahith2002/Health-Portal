"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/app/dashboard/layout";
import { useHospital } from "@/context/HospitalContext";
import { ComplianceReport } from "@/types/hospital";
import { ArrowLeft, Shield, Calendar, User, FileText, Printer } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default function ComplianceReportViewPage({ params }: Props) {
  const { complianceReports, complianceLoading } = useHospital();
  const [id, setId] = useState("");

  useEffect(() => {
    params.then((resolved) => setId(resolved.id));
  }, [params]);

  const report: ComplianceReport | null = id
    ? complianceReports.find((r) => r.id === id) ?? null
    : null;

  if (complianceLoading || !id) {
    return (
      <DashboardLayout pageTitle="Compliance Report">
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!report) {
    return (
      <DashboardLayout pageTitle="Compliance Report">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-700">Report Not Found</h3>
          <p className="text-sm text-red-600 mt-1">The report you&apos;re looking for doesn&apos;t exist.</p>
          {/* ✅ FIXED: Back link */}
          <Link
            href="/hospital/compliance"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Compliance Report Details">
      <div className="flex items-center gap-3 mb-6">
        {/* ✅ FIXED: Back link */}
        <Link href="/hospital/compliance" className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Compliance Report</h1>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold">{report.reportType}</h2>
              <p className="text-purple-100 text-sm">Period: {report.period}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                <Shield className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Report Type</p>
                  <p className="text-sm font-semibold text-slate-900">{report.reportType}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                <User className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Prepared By</p>
                  <p className="text-sm font-semibold text-slate-900">{report.preparedBy}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                <Calendar className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Report Date</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {report.reportDate ? new Date(report.reportDate).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-700">Summary</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{report.summary}</p>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-xl"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            {/* ✅ FIXED: Back link */}
            <Link
              href="/hospital/compliance"
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-xl ml-auto"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}