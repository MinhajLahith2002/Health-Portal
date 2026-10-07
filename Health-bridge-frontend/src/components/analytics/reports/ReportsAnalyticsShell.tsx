"use client";

import { useEffect, useState } from "react";
import { analyticsService } from "@/services/analytics.service";
import type { AnalyticsKpi, AnalyticsPeriod, ReportSummaryDTO, ReportsAnalyticsResponseDTO } from "@/types/analytics";
import AnalyticsNavigation from "@/components/analytics/AnalyticsNavigation";
import ReportActivityChart from "@/components/analytics/reports/ReportActivityChart";
import ReportCategoryDistribution from "@/components/analytics/reports/ReportCategoryDistribution";
import ReportSummaryCards from "@/components/analytics/reports/ReportSummaryCards";
import RecentReportsTable from "@/components/analytics/reports/RecentReportsTable";
import ReportsPanel from "@/components/analytics/reports/ReportsPanel";
import ScheduledReports from "@/components/analytics/reports/ScheduledReports";

const kpiPresentation: Record<string, Pick<AnalyticsKpi, "icon" | "accent">> = {
  "Reports Generated": { icon: "D", accent: "blue" },
  "Scheduled Reports": { icon: "A", accent: "violet" },
  "Reports This Period": { icon: "C", accent: "teal" },
  "Pending Reports": { icon: "L", accent: "amber" },
};

function mapKpis(response: ReportsAnalyticsResponseDTO): AnalyticsKpi[] {
  return response.kpis.map((kpi) => ({
    label: kpi.label,
    value: kpi.value === null ? "—" : kpi.value.toLocaleString(),
    comparison: kpi.value === null ? kpi.reason ?? "Unavailable" : undefined,
    ...kpiPresentation[kpi.label],
  }));
}

function ReportPreview({ report }: { report?: ReportSummaryDTO }) {
  if (!report) return <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center text-sm text-slate-400">Select a backend report to preview its available metadata.</div>;
  return <div className="space-y-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">{report.category}</p><h3 className="mt-1 text-lg font-bold text-slate-900">{report.title}</h3><p className="mt-1 text-xs text-slate-400">{report.reportType} · Generated {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(report.generatedDate))}</p></div><span className="text-xs font-semibold text-slate-600">{report.format}</span></div><p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">Report summary is not provided by the backend.</p></div>;
}

export default function ReportsAnalyticsShell() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("today");
  const [data, setData] = useState<ReportsAnalyticsResponseDTO | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportSummaryDTO>();
  const [retryKey, setRetryKey] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    analyticsService.getReports(period, controller.signal).then((response) => {
      setData(response);
      setSelectedReport(undefined);
      setError(false);
    }).catch(() => {
      if (!controller.signal.aborted) setError(true);
    });
    return () => controller.abort();
  }, [period, retryKey]);

  function handlePeriodChange(nextPeriod: AnalyticsPeriod) {
    if (nextPeriod === period) return;
    setData(null);
    setSelectedReport(undefined);
    setError(false);
    setPeriod(nextPeriod);
  }

  function retry() {
    setData(null);
    setSelectedReport(undefined);
    setError(false);
    setRetryKey((value) => value + 1);
  }

  const lastUpdated = data ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(data.generatedAt)) : "Loading…";

  return <main className="min-h-screen overflow-x-hidden bg-[#f7faff] px-4 py-6 text-slate-900 sm:px-6 lg:px-10 lg:py-8"><div className="mx-auto max-w-7xl"><header className="border-b border-slate-200 pb-6"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Health Bridge insights</p><h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Analytics Reports</h1><p className="mt-2 text-sm text-slate-500">Review reports, activity, categories, and schedules from the reporting backend.</p></div><div className="flex flex-col items-start gap-2 sm:items-end"><p className="text-[11px] text-slate-400">Last updated: {lastUpdated}</p><div className="flex max-w-full flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1" aria-label="Time period">{(["today", "week", "month", "year"] as AnalyticsPeriod[]).map((option) => <button key={option} type="button" onClick={() => handlePeriodChange(option)} className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${period === option ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>{option === "today" ? "Today" : option === "week" ? "This Week" : option === "month" ? "This Month" : "This Year"}</button>)}</div></div></div></header><AnalyticsNavigation />{!data && !error && <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center text-sm text-slate-500" role="status">Loading reports analytics…</div>}{error && <div className="mt-6 rounded-2xl border border-rose-200 bg-white px-6 py-16 text-center" role="alert"><h2 className="font-bold text-slate-900">Reports Analytics failed</h2><p className="mt-2 text-sm text-slate-500">The reports analytics API request failed.</p><button type="button" onClick={retry} className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Retry</button></div>}{data && <><div className="mt-6"><ReportSummaryCards data={mapKpis(data)} /></div><div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2"><ReportsPanel title="Report Preview" description="Backend report metadata"><ReportPreview report={selectedReport} /></ReportsPanel><ReportsPanel title="Category Distribution" description="Backend category counts"><ReportCategoryDistribution categories={data.categoryDistribution} /></ReportsPanel></div><ReportsPanel title="Recent Reports" description="Reports returned by the backend" className="mt-4"><RecentReportsTable reports={data.reports} onView={setSelectedReport} /></ReportsPanel><div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2"><ReportsPanel title="Scheduled Reports" description="Backend-provided report schedules">{data.scheduledReports.length ? <ScheduledReports reports={data.scheduledReports} /> : <p className="py-10 text-center text-sm text-slate-400">{data.availability.find((item) => item.dataSource === "Scheduled Reports")?.reason ?? "Scheduled reports are unavailable."}</p>}</ReportsPanel><ReportsPanel title="Report Activity" description="Generated and exported reports by date">{data.reportActivity.length ? <ReportActivityChart data={data.reportActivity} /> : <p className="py-10 text-center text-sm text-slate-400">{data.availability.find((item) => item.dataSource === "Report Activity")?.reason ?? "Report activity is unavailable."}</p>}</ReportsPanel></div><p className="mt-5 text-center text-xs font-medium text-slate-500">Reports data source: {data.dataAvailability}</p></>}</div></main>;
}
