"use client";

import { useEffect, useState } from "react";
import { analyticsService } from "@/services/analytics.service";
import type { AnalyticsKpi, AnalyticsPeriod, OperationalAnalyticsResponseDto, OperationalMetricAvailabilityDto } from "@/types/analytics";
import AnalyticsHeader from "@/components/analytics/AnalyticsHeader";
import AnalyticsKpiCard from "@/components/analytics/AnalyticsKpiCard";
import AnalyticsNavigation from "@/components/analytics/AnalyticsNavigation";
import OperationalPanel from "@/components/analytics/operational/OperationalPanel";
import OperationalInventorySummary from "@/components/analytics/operational/OperationalInventorySummary";
import OperationalLaboratorySummary from "@/components/analytics/operational/OperationalLaboratorySummary";

const kpiPresentation: Record<string, Pick<AnalyticsKpi, "icon" | "accent">> = {
  "Inventory Items": { icon: "I", accent: "blue" },
  "Low Stock Items": { icon: "L", accent: "amber" },
  "Out of Stock Items": { icon: "L", accent: "rose" },
  "Inventory Value": { icon: "R", accent: "teal" },
  "Lab Test Orders": { icon: "A", accent: "violet" },
  "Lab Completion Rate": { icon: "C", accent: "green" },
  "Bed Occupancy": { icon: "H", accent: "blue" },
  "Staff Utilization": { icon: "P", accent: "violet" },
  "Equipment Utilization": { icon: "I", accent: "teal" },
  "Average Wait Time": { icon: "C", accent: "green" },
  "Appointment Completion": { icon: "A", accent: "amber" },
};

function formatKpiValue(name: string, value: number | null, unit: string) {
  if (value === null) return "—";
  if (unit === "currency units") return `Rs. ${value.toLocaleString()}`;
  if (unit === "percent") return `${value}%`;
  if (unit === "hours") return `${value} hrs`;
  return `${value.toLocaleString()} ${unit}`;
}

function mapKpis(response: OperationalAnalyticsResponseDto): AnalyticsKpi[] {
  return response.kpis.map((kpi) => ({ label: kpi.name, value: formatKpiValue(kpi.name, kpi.value, kpi.unit), ...kpiPresentation[kpi.name] }));
}

function UnavailableState({ metric }: { metric?: OperationalMetricAvailabilityDto }) {
  return <div className="flex min-h-24 items-center justify-center text-center text-sm text-slate-400">—<span className="ml-2">Unavailable{metric?.reason ? `: ${metric.reason}` : ""}</span></div>;
}

function AvailabilityList({ data }: { data: OperationalAnalyticsResponseDto["resourceAvailability"] }) {
  return <div className="space-y-3">{data.map((entry) => <div key={entry.resource} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 text-sm last:border-0 last:pb-0"><div><p className="font-medium text-slate-700">{entry.resource}</p><p className="mt-1 text-xs text-slate-400">{entry.definition ?? entry.reason}</p></div><strong className="shrink-0 text-slate-800">{entry.workloadCount === null ? "—" : `${entry.workloadCount.toLocaleString()} ${entry.workloadUnit ?? ""}`}</strong></div>)}</div>;
}

function Summary({ data }: { data: OperationalAnalyticsResponseDto["operationalSummary"] }) {
  const rows = [["Inventory items", data.inventoryItems.toLocaleString()], ["Low-stock items", data.lowStockItems.toLocaleString()], ["Out-of-stock items", data.outOfStockItems.toLocaleString()], ["Laboratory orders", data.laboratoryOrders.toLocaleString()], ["Laboratory completion", `${data.laboratoryCompletionRate}%`], ["Average laboratory turnaround", `${data.averageLaboratoryTurnaroundHours} hrs`]];
  return <div className="divide-y divide-slate-100">{rows.map(([label, value]) => <div key={label} className="flex items-center justify-between gap-4 py-3 text-sm"><span className="text-slate-500">{label}</span><strong className="text-slate-800">{value}</strong></div>)}</div>;
}

export default function OperationalAnalyticsShell() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("today");
  const [data, setData] = useState<OperationalAnalyticsResponseDto | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    analyticsService.getOperational(period, controller.signal).then((response) => {
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
  const bedOccupancy = data?.availability.find((metric) => metric.metric === "Bed Occupancy");
  const staffUtilization = data?.availability.find((metric) => metric.metric === "Staff Utilization");
  const equipmentUtilization = data?.availability.find((metric) => metric.metric === "Equipment Utilization");

  return <main className="min-h-screen overflow-x-hidden bg-[#f7faff] px-4 py-6 text-slate-900 sm:px-6 lg:px-10 lg:py-8"><div className="mx-auto max-w-7xl"><AnalyticsHeader period={period} onPeriodChange={handlePeriodChange} title="Operational Analytics" subtitle="Inventory and laboratory operations for the selected period." lastUpdated={lastUpdated} /><AnalyticsNavigation />{!data && !error && <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center text-sm text-slate-500" role="status">Loading operational data…</div>}{error && <div className="mt-6 rounded-2xl border border-rose-200 bg-white px-6 py-16 text-center" role="alert"><h2 className="font-bold text-slate-900">Operational Analytics failed</h2><p className="mt-2 text-sm text-slate-500">The operational analytics API request failed.</p><button type="button" onClick={retry} className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Retry</button></div>}{data && <><div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{mapKpis(data).map((kpi) => <AnalyticsKpiCard key={kpi.label} kpi={kpi} />)}</div><div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2"><OperationalPanel title="Inventory Analytics" description="Persisted inventory statuses and covered inventory value"><OperationalInventorySummary data={data.inventorySummary} /></OperationalPanel><OperationalPanel title="Laboratory Operations" description="Lab order status, sample status, completion, and turnaround"><OperationalLaboratorySummary operations={data.laboratoryOperations} turnaround={data.labTurnaround} /></OperationalPanel><OperationalPanel title="Resource Workload" description="Backend-provided workload and availability"><AvailabilityList data={data.resourceAvailability} /></OperationalPanel><OperationalPanel title="Bed Occupancy" description="Unavailable in the current backend"><UnavailableState metric={bedOccupancy} /></OperationalPanel><OperationalPanel title="Staff Utilization" description="Unavailable in the current backend"><UnavailableState metric={staffUtilization} /></OperationalPanel><OperationalPanel title="Equipment Utilization" description="Unavailable in the current backend"><UnavailableState metric={equipmentUtilization} /></OperationalPanel><OperationalPanel title="Patient Flow" description="Unavailable in the current backend"><UnavailableState metric={data.patientFlow} /></OperationalPanel><OperationalPanel title="Appointment Efficiency" description="Unavailable in the current backend"><UnavailableState metric={data.appointmentEfficiency} /></OperationalPanel></div><OperationalPanel title="Operational Summary" description="Backend operational summary for the selected period" className="mt-4"><Summary data={data.operationalSummary} /></OperationalPanel><p className="mt-5 text-center text-xs font-medium text-slate-500">Operational data source: {data.dataAvailability}</p></>}</div></main>;
}
