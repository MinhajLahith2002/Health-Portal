"use client";

import { useEffect, useState } from "react";
import { analyticsService } from "@/services/analytics.service";
import type { AnalyticsKpi, AnalyticsPeriod, PopulationHealthAnalyticsResponseDto, PopulationMetricAvailabilityDto } from "@/types/analytics";
import AnalyticsHeader from "@/components/analytics/AnalyticsHeader";
import AnalyticsKpiCard from "@/components/analytics/AnalyticsKpiCard";
import AnalyticsNavigation from "@/components/analytics/AnalyticsNavigation";
import AgeDistributionChart from "@/components/analytics/population-health/AgeDistributionChart";
import GenderDistributionChart from "@/components/analytics/population-health/GenderDistributionChart";
import BloodGroupDistribution from "@/components/analytics/population-health/BloodGroupDistribution";
import LabHealthIndicators from "@/components/analytics/population-health/LabHealthIndicators";
import PopulationGrowthChart from "@/components/analytics/population-health/PopulationGrowthChart";
import PopulationHealthPanel from "@/components/analytics/population-health/PopulationHealthPanel";
import PopulationHealthSummaryTable from "@/components/analytics/population-health/PopulationHealthSummaryTable";

const kpiPresentation: Record<string, Pick<AnalyticsKpi, "icon" | "accent">> = {
  "Registered Patient Accounts": { icon: "P", accent: "blue" },
  "New Patient Accounts": { icon: "P", accent: "violet" },
  "Published Lab Results": { icon: "L", accent: "teal" },
  "Abnormal Lab Results": { icon: "L", accent: "amber" },
  "Critical Lab Results": { icon: "L", accent: "rose" },
  "Common Conditions": { icon: "C", accent: "amber" },
  "Health Risk": { icon: "I", accent: "rose" },
};

function mapKpis(response: PopulationHealthAnalyticsResponseDto): AnalyticsKpi[] {
  return response.kpis.map((kpi) => ({ label: kpi.name, value: kpi.value === null ? "—" : kpi.value.toLocaleString(), ...kpiPresentation[kpi.name] }));
}

function UnavailableState({ metric }: { metric: PopulationMetricAvailabilityDto }) {
  return <div className="flex min-h-28 items-center justify-center text-center text-sm text-slate-400">—<span className="ml-2">Unavailable{metric.reason ? `: ${metric.reason}` : ""}</span></div>;
}

export default function PopulationHealthShell() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("today");
  const [data, setData] = useState<PopulationHealthAnalyticsResponseDto | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    analyticsService.getPopulationHealth(period, controller.signal).then((response) => {
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

  return <main className="min-h-screen overflow-x-hidden bg-[#f7faff] px-4 py-6 text-slate-900 sm:px-6 lg:px-10 lg:py-8"><div className="mx-auto max-w-7xl"><AnalyticsHeader period={period} onPeriodChange={handlePeriodChange} title="Population Health" subtitle="Registered population, demographics, and laboratory indicators." lastUpdated={lastUpdated} /><AnalyticsNavigation />{!data && !error && <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center text-sm text-slate-500" role="status">Loading population health data…</div>}{error && <div className="mt-6 rounded-2xl border border-rose-200 bg-white px-6 py-16 text-center" role="alert"><h2 className="font-bold text-slate-900">Population Health Analytics failed</h2><p className="mt-2 text-sm text-slate-500">The population health analytics API request failed.</p><button type="button" onClick={retry} className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Retry</button></div>}{data && <><div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{mapKpis(data).map((kpi) => <AnalyticsKpiCard key={kpi.label} kpi={kpi} />)}</div><div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2"><PopulationHealthPanel title="Population Growth Trend" description="Registered patient accounts and new accounts over time" className="xl:col-span-2"><PopulationGrowthChart data={data.populationGrowth} /></PopulationHealthPanel><PopulationHealthPanel title="Age Distribution" description="Backend age groups and count-based share"><AgeDistributionChart data={data.ageDistribution} /></PopulationHealthPanel><PopulationHealthPanel title="Gender Distribution" description="Male, Female, Other, and Unknown backend buckets"><GenderDistributionChart data={data.genderDistribution} /></PopulationHealthPanel><PopulationHealthPanel title="Blood Group Distribution" description="Recognized backend blood-group values"><BloodGroupDistribution data={data.bloodGroupDistribution} /></PopulationHealthPanel><PopulationHealthPanel title="Laboratory Health Indicators" description="Published lab results for the selected period"><LabHealthIndicators data={data.labHealthIndicators} /></PopulationHealthPanel><PopulationHealthPanel title="Common Health Conditions" description="Unavailable in the current backend"><UnavailableState metric={data.commonConditions} /></PopulationHealthPanel><PopulationHealthPanel title="Health Risk Distribution" description="Unavailable in the current backend"><UnavailableState metric={data.healthRisk} /></PopulationHealthPanel><PopulationHealthPanel title="Healthcare Utilization by Age" description="Unavailable in the current backend"><UnavailableState metric={data.healthcareUtilizationByAge} /></PopulationHealthPanel><PopulationHealthPanel title="Preventive Care Trend" description="Unavailable in the current backend"><UnavailableState metric={data.preventiveCare} /></PopulationHealthPanel><PopulationHealthPanel title="Regional Health Patterns" description="Unavailable in the current backend" className="xl:col-span-2"><UnavailableState metric={data.regionalPatterns} /></PopulationHealthPanel></div><PopulationHealthPanel title="Population Health Summary" description="Backend aggregate summary for the selected period" className="mt-4"><PopulationHealthSummaryTable data={data.populationHealthSummary} /></PopulationHealthPanel><p className="mt-5 text-center text-xs font-medium text-slate-500">Population Health data source: {data.dataAvailability}</p></>}</div></main>;
}
