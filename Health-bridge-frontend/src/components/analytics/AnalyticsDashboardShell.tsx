"use client";

import { useEffect, useState } from "react";
import { analyticsService } from "@/services/analytics.service";
import type { AnalyticsDashboardPresentation, AnalyticsDashboardResponseDto, AnalyticsDataAvailability, AnalyticsKpi, AnalyticsPeriod } from "@/types/analytics";
import AnalyticsHeader from "@/components/analytics/AnalyticsHeader";
import AnalyticsKpiCard from "@/components/analytics/AnalyticsKpiCard";
import AnalyticsNavigation from "@/components/analytics/AnalyticsNavigation";
import AnalyticsSummaryTable from "@/components/analytics/AnalyticsSummaryTable";
import DepartmentPerformance from "@/components/analytics/DepartmentPerformance";
import PatientTrendChart from "@/components/analytics/PatientTrendChart";
import ResourceUtilizationChart from "@/components/analytics/ResourceUtilizationChart";
import RevenueTrendChart from "@/components/analytics/RevenueTrendChart";

const kpiPresentation: Record<string, Pick<AnalyticsKpi, "icon" | "accent">> = {
  "Total Patients": { icon: "P", accent: "blue" },
  "Total Appointments": { icon: "A", accent: "violet" },
  "Total Consultations": { icon: "C", accent: "teal" },
  "Total Revenue": { icon: "R", accent: "amber" },
  "Lab Tests": { icon: "L", accent: "rose" },
  "Insurance Claims": { icon: "I", accent: "green" },
};

function mapDashboard(response: AnalyticsDashboardResponseDto): AnalyticsDashboardPresentation {
  return {
    kpis: response.kpis.map(({ label, value }) => ({ label, value: label === "Total Revenue" ? `Rs. ${(value / 1_000_000).toFixed(2)}M` : value.toLocaleString(), ...(kpiPresentation[label] ?? { icon: "D", accent: "blue" }) })),
    patientTrends: response.patientTrends,
    revenue: response.revenueTrend.map(({ month, revenue }) => ({ month, revenue: revenue / 1_000_000 })),
    resources: response.resourceUtilization,
    departmentPerformance: response.departmentPerformance,
    operationalSummary: response.operationalSummary.map((row) => ({ ...row, revenue: row.revenue / 1_000_000 })),
  };
}

function Panel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_6px_20px_rgba(15,23,42,0.04)] sm:p-5"><div className="mb-4"><h2 className="text-sm font-bold text-slate-900">{title}</h2><p className="mt-1 text-xs text-slate-400">{description}</p></div>{children}</section>;
}

export default function AnalyticsDashboardShell() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("today");
  const [retryKey, setRetryKey] = useState(0);
  const [data, setData] = useState<AnalyticsDashboardPresentation | null>(null);
  const [availability, setAvailability] = useState<AnalyticsDataAvailability | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    analyticsService.getDashboard(period).then((response) => {
      setData(mapDashboard(response));
      setAvailability(response.dataAvailability);
      setGeneratedAt(response.generatedAt);
    }).catch(() => {
      setError(true);
    });
  }, [period, retryKey]);

  function handlePeriodChange(nextPeriod: AnalyticsPeriod) {
    if (nextPeriod === period) return;
    setData(null);
    setAvailability(null);
    setGeneratedAt(null);
    setError(false);
    setPeriod(nextPeriod);
  }

  function retry() {
    setData(null);
    setAvailability(null);
    setGeneratedAt(null);
    setError(false);
    setRetryKey((value) => value + 1);
  }

  const lastUpdated = generatedAt ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(generatedAt)) : "Loading…";

  return <main className="min-h-screen bg-[#f7faff] px-4 py-6 text-slate-900 sm:px-6 lg:px-10 lg:py-8"><div className="mx-auto max-w-7xl"><AnalyticsHeader period={period} onPeriodChange={handlePeriodChange} lastUpdated={lastUpdated} /><AnalyticsNavigation />{!data && !error && <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center text-sm text-slate-500 shadow-[0_6px_20px_rgba(15,23,42,0.04)]" role="status">Loading dashboard data…</div>}{error && <div className="mt-6 rounded-2xl border border-rose-200 bg-white px-6 py-16 text-center shadow-[0_6px_20px_rgba(15,23,42,0.04)]" role="alert"><h2 className="font-bold text-slate-900">Unable to load Analytics Dashboard</h2><p className="mt-2 text-sm text-slate-500">The dashboard API request failed. Please try again.</p><button type="button" onClick={retry} className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Retry</button></div>}{data && <><div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{data.kpis.map((kpi) => <AnalyticsKpiCard key={kpi.label} kpi={kpi} />)}</div><div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2"><Panel title="Patient Trends" description="Monthly patient growth">{data.patientTrends.length ? <PatientTrendChart data={data.patientTrends} /> : <EmptyState />}</Panel><Panel title="Revenue Overview" description="Monthly revenue in millions">{data.revenue.length ? <RevenueTrendChart data={data.revenue} /> : <EmptyState />}</Panel><Panel title="Resource Utilization" description="Current usage by resource">{data.resources.length ? <ResourceUtilizationChart data={data.resources} /> : <EmptyState />}</Panel><Panel title="Department Performance" description="Performance comparison across departments">{data.departmentPerformance.length ? <DepartmentPerformance data={data.departmentPerformance} /> : <EmptyState />}</Panel></div><div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_6px_20px_rgba(15,23,42,0.04)] sm:p-5"><div className="mb-4"><h2 className="text-sm font-bold text-slate-900">Operational Summary</h2><p className="mt-1 text-xs text-slate-400">Department-level snapshot for the selected period</p></div>{data.operationalSummary.length ? <AnalyticsSummaryTable data={data.operationalSummary} /> : <p className="py-10 text-center text-sm text-slate-400">No operational summary is available for this period.</p>}</div><p className="mt-5 text-center text-xs font-medium text-slate-500">Dashboard data source: {availability}</p></>}</div></main>;
}

function EmptyState() {
  return <div className="flex h-64 items-center justify-center text-sm text-slate-400">No data available for this period.</div>;
}
