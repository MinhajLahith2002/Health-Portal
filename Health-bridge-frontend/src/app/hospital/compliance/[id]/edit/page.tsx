"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/app/dashboard/layout";
import { ComplianceReportForm } from "@/components/hospital/billing/ComplianceReportForm";
import { useHospital } from "@/context/HospitalContext";
import { ComplianceReportRequest } from "@/types/hospital";
import PageHeader from "@/components/ui/PageHeader";
import { AlertCircle } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditCompliancePage({ params }: PageProps) {
  const router = useRouter();
  const { complianceReports, complianceLoading, updateComplianceReport } = useHospital();
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    params.then((r) => {
      setId(r.id);
      setLoading(false);
    });
  }, [params]);

  const report = id ? complianceReports.find((r) => r.id === id) ?? null : null;
  const isLoading = loading || complianceLoading;

  const handleSubmit = async (data: ComplianceReportRequest) => {
    if (!report) return;
    setIsSubmitting(true);
    try {
      await updateComplianceReport(report.id, data);
      router.push(`/hospital/compliance`);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout pageTitle="Edit Report">
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </DashboardLayout>
    );
  }

  if (!report) {
    return (
      <DashboardLayout pageTitle="Edit Report">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-lg mx-auto">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-700">Report Not Found</h3>
          <Link
            href="/hospital/compliance"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl"
          >
            Back to Compliance
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Edit Report">
      <PageHeader
        title="Edit Compliance Report"
        subtitle={report.reportType}
        backHref="/hospital/compliance"
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <ComplianceReportForm
          initialData={{
            hospitalId: report.hospitalId,
            reportType: report.reportType,
            period: report.period,
            status: report.status,
            summary: report.summary,
            preparedBy: report.preparedBy,
          }}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/hospital/compliance")}
          isLoading={isSubmitting}
        />
      </div>
    </DashboardLayout>
  );
}