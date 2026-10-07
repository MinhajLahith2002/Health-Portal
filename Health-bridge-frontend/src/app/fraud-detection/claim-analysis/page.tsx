"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, FileSearch } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FraudDetectionTabs from "@/components/fraud-detection/FraudDetectionTabs";
import RiskScoreGauge from "@/components/fraud-detection/RiskScoreGauge";
import { fraudDetectionService, type FraudRecord } from "@/services/fraudDetectionService";
import { insuranceService } from "@/services/insuranceService";

const text = (record: FraudRecord | undefined, ...keys: string[]) => {
  const key = keys.find((item) => record?.[item] !== undefined && record[item] !== null);
  return key ? String(record?.[key]) : "-";
};

// The analyze endpoint nests the alert fields (severity, riskScore, ...) under `alert`.
const flattenAnalysis = (raw: FraudRecord | undefined): FraudRecord => {
  const alert = raw && typeof raw.alert === "object" && raw.alert !== null ? (raw.alert as FraudRecord) : {};
  const { alert: _alert, ...rest } = raw ?? {};
  return { ...rest, ...alert };
};

export default function ClaimAnalysisPage() {
  const claimId = useSearchParams().get("claimId") ?? "";
  const [analysis, setAnalysis] = useState<FraudRecord>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const id = claimId;
    setLoading(true);
    setError(null);
    Promise.allSettled([
      id ? insuranceService.getClaimById(id) : Promise.resolve(undefined),
      id ? fraudDetectionService.analyzeClaim(id) : Promise.resolve({}),
    ]).then(([claimResult, result]) => {
      const claim = claimResult.status === "fulfilled" ? claimResult.value : undefined;
      const analyzed = result.status === "fulfilled" ? result.value : {};
      setAnalysis({ ...flattenAnalysis(analyzed as FraudRecord), claim });
      if (claimResult.status === "rejected" && result.status === "rejected") {
        setError("Claim analysis data is unavailable.");
      } else if (id && result.status === "rejected") {
        setMessage("Automatic fraud analysis for this claim could not be completed.");
      }
    }).finally(() => setLoading(false));
  }, [claimId]);

  const detailEntries = Object.entries(analysis ?? {}).filter(([key]) => key !== "claim").slice(0, 8);
  const riskScoreValue = Number(text(analysis, "riskScore", "score")) || 0;
  const severityLabel = text(analysis, "severity", "riskLevel", "risk").toUpperCase();

  return (
    <DashboardLayout pageTitle="Insurance" userRole="INSURANCE_OFFICER">
      <div className="min-h-screen bg-[#fbfcfd] px-4 py-6 text-[#16191d] sm:px-7 lg:px-10 lg:py-9">
        <div className="mx-auto max-w-7xl">
          <FraudDetectionTabs />
          <Link href="/fraud-detection/alerts" className="mb-5 inline-flex items-center gap-2 text-[11px] text-[#6c7680]">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to alerts
          </Link>
          <header className="mb-7">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6c7680]">Investigation workspace</p>
            <h1 className="text-[28px] font-semibold sm:text-[32px]">Claim analysis</h1>
            <p className="mt-1 text-sm text-[#7b838c]">Inspect the live analysis returned for a flagged claim.</p>
          </header>
          {loading && (
            <div role="status" className="rounded-2xl border bg-white p-8 text-center text-sm text-[#707981]">
              Loading claim analysis...
            </div>
          )}
          {error && (
            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">
              {error}
            </div>
          )}
          {!loading && !error && (
            <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.8fr)]">
              <article className="rounded-2xl border border-[#e7e9ec] bg-white p-5 sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">{claimId || "No claim selected"}</h2>
                      <span className="rounded-full bg-[#fff7e8] px-2 py-1 text-[10px]">
                        {text(analysis, "severity", "riskLevel", "risk")} risk
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-[#9299a0]">{text(analysis, "description", "claimSummary", "reason")}</p>
                  </div>
                  <FileSearch className="h-5 w-5 text-[#398bff]" />
                </div>
                {message && (
                  <p role="status" className="mt-4 rounded-lg bg-[#e8fbf4] px-4 py-3 text-xs text-[#008b65]">
                    {message}
                  </p>
                )}
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {detailEntries.map(([key, value]) => (
                    <div key={key} className="rounded-xl bg-[#fafbfc] px-4 py-3">
                      <p className="text-[10px] text-[#9299a0]">{key}</p>
                      <p className="mt-1 wrap-break-word text-sm font-medium text-[#30373d]">
                        {typeof value === "object" ? JSON.stringify(value) : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
              <div className="space-y-4">
                <RiskScoreGauge score={riskScoreValue} label={severityLabel === "-" ? "UNSCORED" : severityLabel} />
              </div>
            </section>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
