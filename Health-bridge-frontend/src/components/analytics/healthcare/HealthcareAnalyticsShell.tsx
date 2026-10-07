"use client";

import { useEffect, useState } from "react";
import AnalyticsHeader from "@/components/analytics/AnalyticsHeader";
import AnalyticsKpiCard from "@/components/analytics/AnalyticsKpiCard";
import AnalyticsNavigation from "@/components/analytics/AnalyticsNavigation";
import ClinicalActivityChart from "@/components/analytics/healthcare/ClinicalActivityChart";
import HealthcarePanel from "@/components/analytics/healthcare/HealthcarePanel";
import PatientDemographics from "@/components/analytics/healthcare/PatientDemographics";
import PatientGrowthChart from "@/components/analytics/healthcare/PatientGrowthChart";
import { analyticsService } from "@/services/analytics.service";
import type { AnalyticsKpi, AnalyticsPeriod } from "@/types/analytics";
import type { DemographicDistributionResponseDto, HealthcareAnalyticsResponseDto, HealthcareMetricAvailabilityResponseDto } from "@/types/healthcareAnalytics";

const kpiPresentation: Record<string, { icon: string; accent: string }> = {
  "Total Patients": { icon: "P", accent: "blue" }, "New Patients": { icon: "C", accent: "teal" },
  "Completed Consultations": { icon: "H", accent: "violet" }, "Appointment Completion Rate": { icon: "A", accent: "amber" },
  "Laboratory Tests": { icon: "L", accent: "green" }, "Prescriptions Issued": { icon: "D", accent: "rose" },
};

function UnavailableState({ metric }: { metric: HealthcareMetricAvailabilityResponseDto }) {
  return <div className="flex min-h-64 flex-col items-center justify-center rounded-xl bg-slate-50 px-6 text-center" role="status"><p className="text-sm font-semibold text-slate-700">{metric.status === "UNAVAILABLE" ? "Unavailable" : metric.status}</p><p className="mt-2 max-w-md text-xs leading-5 text-slate-500">{metric.reason ?? metric.definition ?? "No data is available for this period."}</p></div>;
}

function coverageText(value: DemographicDistributionResponseDto) {
  return `${value.validRecords.toLocaleString()} of ${value.totalPatientAccounts.toLocaleString()} patient accounts represented; ${value.excludedRecords.toLocaleString()} excluded. ${value.note}`;
}

function percentages(value: DemographicDistributionResponseDto) {
  return value.distribution.map((point) => ({ label: point.label, value: value.totalPatientAccounts ? Number(((point.count / value.totalPatientAccounts) * 100).toFixed(1)) : 0 }));
}

export default function HealthcareAnalyticsShell() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("today");
  const [retryKey, setRetryKey] = useState(0);
  const [data, setData] = useState<HealthcareAnalyticsResponseDto | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    analyticsService.getHealthcare(period, controller.signal).then(setData).catch((requestError: unknown) => {
      if (!controller.signal.aborted) { console.error("Failed to load healthcare analytics", requestError); setError(true); }
    });
    return () => controller.abort();
  }, [period, retryKey]);

  const lastUpdated = data ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(data.generatedAt)) : "Loading…";
  const kpis: AnalyticsKpi[] = data?.kpis.map((kpi) => ({ label: kpi.name, value: kpi.value === null ? "—" : kpi.value.toLocaleString(), icon: kpiPresentation[kpi.name]?.icon ?? "H", accent: kpiPresentation[kpi.name]?.accent ?? "blue", comparison: kpi.reason ?? undefined })) ?? [];
  const growth = data?.patientGrowth.map((point) => ({ month: point.periodLabel, newPatients: point.newPatients, totalPatients: point.totalPatients })) ?? [];
  const laboratory = data ? [
    { status: "Requested", orders: data.laboratoryActivity.requested }, { status: "Sample collected", orders: data.laboratoryActivity.sampleCollected },
    { status: "Processing", orders: data.laboratoryActivity.processing }, { status: "Completed", orders: data.laboratoryActivity.completed },
    { status: "Cancelled", orders: data.laboratoryActivity.cancelled },
  ] : [];
  const changePeriod = (nextPeriod: AnalyticsPeriod) => { setData(null); setError(false); setPeriod(nextPeriod); };
  const retry = () => { setData(null); setError(false); setRetryKey((value) => value + 1); };

  return <main className="min-h-screen overflow-x-hidden bg-[#f7faff] px-4 py-6 text-slate-900 sm:px-6 lg:px-10 lg:py-8"><div className="mx-auto max-w-7xl">
    <AnalyticsHeader period={period} onPeriodChange={changePeriod} title="Healthcare Analytics" subtitle="Patient activity, clinical trends, and healthcare service performance." lastUpdated={lastUpdated} />
    <AnalyticsNavigation />
    {!data && !error && <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center text-sm text-slate-500 shadow-sm" role="status">Loading healthcare analytics…</div>}
    {error && <div className="mt-6 rounded-2xl border border-rose-200 bg-white px-6 py-16 text-center shadow-sm" role="alert"><h2 className="font-bold text-slate-900">Unable to load Healthcare Analytics</h2><p className="mt-2 text-sm text-slate-500">The healthcare analytics API request failed. Please try again.</p><button type="button" onClick={retry} className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Retry</button></div>}
    {data && <><div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{kpis.map((kpi) => <AnalyticsKpiCard key={kpi.label} kpi={kpi} />)}</div>
      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <HealthcarePanel title="Patient Growth" description="New and total registered patient accounts over time" className="xl:col-span-2">{growth.length ? <PatientGrowthChart data={growth} /> : <p className="py-24 text-center text-sm text-slate-400">No patient growth data is available for this period.</p>}</HealthcarePanel>
        <HealthcarePanel title="Appointment & Consultation Analytics" description="Appointment outcomes and completed consultations"><UnavailableState metric={data.appointmentAnalytics} /></HealthcarePanel>
        <HealthcarePanel title="Laboratory Activity" description="Laboratory test order documents by current status"><ClinicalActivityChart data={laboratory} /><p className="mt-2 text-xs leading-5 text-slate-400">{data.laboratoryActivity.definition}</p><div className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">{[data.clinicalActivity.consultations, data.clinicalActivity.prescriptions, data.clinicalActivity.telemedicine].map((metric) => <p key={metric.metric}><strong className="text-slate-600">{metric.metric} unavailable:</strong> {metric.reason}</p>)}</div></HealthcarePanel>
        <HealthcarePanel title="Patient Demographics" description="Age and gender distribution"><PatientDemographics ageGroups={percentages(data.ageDistribution)} genderDistribution={percentages(data.genderDistribution)} /><div className="mt-4 space-y-1 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500"><p><strong className="text-slate-600">Age coverage:</strong> {coverageText(data.ageDistribution)}</p><p><strong className="text-slate-600">Gender coverage:</strong> {coverageText(data.genderDistribution)}</p></div></HealthcarePanel>
        <HealthcarePanel title="Department Healthcare Activity" description="Completion rate across healthcare services"><UnavailableState metric={data.departmentActivity} /></HealthcarePanel>
      </div>
      <HealthcarePanel title="Healthcare Performance Summary" description="Available healthcare totals for the selected period" className="mt-4"><div className="grid gap-3 sm:grid-cols-3">{[["Registered patient accounts", data.performanceSummary.registeredPatientAccounts], ["New registered accounts", data.performanceSummary.newRegisteredPatientAccounts], ["Laboratory test orders", data.performanceSummary.laboratoryTestOrders]].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-xl font-bold">{Number(value).toLocaleString()}</p></div>)}</div><div className="mt-3 rounded-xl border border-slate-100 px-4 py-3 text-xs text-slate-500"><strong className="text-slate-600">Department performance unavailable:</strong> {data.performanceSummary.departmentPerformance.reason}</div></HealthcarePanel>
      <p className="mt-5 text-center text-xs font-medium text-slate-500">Healthcare data source: {data.dataAvailability}</p></>}
  </div></main>;
}
