"use client";

import { useEffect, useState } from "react";
import { analyticsService } from "@/services/analytics.service";
import type { AnalyticsKpi, AnalyticsPeriod, FinancialAnalyticsResponseDto } from "@/types/analytics";
import AnalyticsHeader from "@/components/analytics/AnalyticsHeader";
import AnalyticsKpiCard from "@/components/analytics/AnalyticsKpiCard";
import AnalyticsNavigation from "@/components/analytics/AnalyticsNavigation";
import FinancialPanel from "@/components/analytics/financial/FinancialPanel";
import FinancialPerformanceTable from "@/components/analytics/financial/FinancialPerformanceTable";
import PaymentStatusChart from "@/components/analytics/financial/PaymentStatusChart";
import RevenueBySourceChart from "@/components/analytics/financial/RevenueBySourceChart";
import RevenueTrendChart from "@/components/analytics/financial/RevenueTrendChart";

const kpiPresentation: Record<string, Pick<AnalyticsKpi, "icon" | "accent">> = {
  "Billed Revenue": { icon: "R", accent: "blue" },
  "Invoice Count": { icon: "A", accent: "teal" },
  "Paid Invoices": { icon: "C", accent: "green" },
  "Known Unpaid Invoice Amount": { icon: "L", accent: "amber" },
  "Insurance Revenue": { icon: "I", accent: "violet" },
  Refunds: { icon: "C", accent: "rose" },
};

function formatKpiValue(name: string, value: number | null) {
  if (value === null) return "—";
  if (name.includes("Revenue") || name.includes("Amount")) return `Rs. ${(value / 1_000_000).toFixed(2)}M`;
  return value.toLocaleString();
}

function mapKpis(response: FinancialAnalyticsResponseDto): AnalyticsKpi[] {
  return response.kpis.map((kpi) => ({
    label: kpi.name,
    value: formatKpiValue(kpi.name, kpi.value),
    ...kpiPresentation[kpi.name],
  }));
}

function UnavailableState({ reason }: { reason?: string | null }) {
  return <div className="flex min-h-28 items-center justify-center text-center text-sm text-slate-400">—<span className="ml-2">Unavailable{reason ? `: ${reason}` : ""}</span></div>;
}

export default function FinancialAnalyticsShell() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("today");
  const [data, setData] = useState<FinancialAnalyticsResponseDto | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    analyticsService.getFinancial(period, controller.signal).then((response) => {
      setData(response);
      setError(false);
    }).catch(() => {
      if (!controller.signal.aborted) setError(true);
    });
    return () => controller.abort();
  }, [period, retryKey]);

  function handlePeriodChange(nextPeriod: AnalyticsPeriod) {
    if (nextPeriod === period) return;
    setData(null);
    setError(false);
    setPeriod(nextPeriod);
  }

  function retry() {
    setData(null);
    setError(false);
    setRetryKey((value) => value + 1);
  }

  const lastUpdated = data ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(data.generatedAt)) : "Loading…";
  const insurance = data?.availability.find((metric) => metric.metric === "Insurance Revenue");
  const refunds = data?.availability.find((metric) => metric.metric === "Refunds");

  return <main className="min-h-screen overflow-x-hidden bg-[#f7faff] px-4 py-6 text-slate-900 sm:px-6 lg:px-10 lg:py-8"><div className="mx-auto max-w-7xl"><AnalyticsHeader period={period} onPeriodChange={handlePeriodChange} title="Financial Analytics" subtitle="Billed revenue, invoice status, and payment status for the selected period." lastUpdated={lastUpdated} /><AnalyticsNavigation />{!data && !error && <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center text-sm text-slate-500" role="status">Loading financial data…</div>}{error && <div className="mt-6 rounded-2xl border border-rose-200 bg-white px-6 py-16 text-center" role="alert"><h2 className="font-bold text-slate-900">Financial Analytics failed</h2><p className="mt-2 text-sm text-slate-500">The financial analytics API request failed.</p><button type="button" onClick={retry} className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Retry</button></div>}{data && <><div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{mapKpis(data).map((kpi) => <AnalyticsKpiCard key={kpi.label} kpi={kpi} />)}</div><div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2"><FinancialPanel title="Revenue Trend" description="Billed revenue from invoice totals" className="xl:col-span-2">{data.revenueTrend.length ? <RevenueTrendChart data={data.revenueTrend} /> : <UnavailableState />}</FinancialPanel><FinancialPanel title="Revenue by Source" description="Actual billing item categories">{data.revenueBySource.sources.length ? <RevenueBySourceChart data={data.revenueBySource} /> : <UnavailableState reason={data.revenueBySource.note} />}</FinancialPanel><FinancialPanel title="Invoice Status" description="Invoice counts by backend status"><PaymentStatusChart data={data.invoiceStatus} /></FinancialPanel><FinancialPanel title="Payment Status" description="Invoice-level payment status counts"><PaymentStatusChart data={data.paymentStatus} /></FinancialPanel><FinancialPanel title="Insurance Revenue" description="Unavailable in the current backend"> <UnavailableState reason={insurance?.reason} /></FinancialPanel><FinancialPanel title="Refunds" description="Unavailable in the current backend"><UnavailableState reason={refunds?.reason} /></FinancialPanel></div><FinancialPanel title="Financial Summary" description="Selected-period invoice summary" className="mt-4"><FinancialPerformanceTable data={data.financialSummary} /></FinancialPanel><p className="mt-5 text-center text-xs font-medium text-slate-500">Financial data source: {data.dataAvailability}</p></>}</div></main>;
}
