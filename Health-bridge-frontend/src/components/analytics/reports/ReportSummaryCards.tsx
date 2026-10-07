import AnalyticsKpiCard from "@/components/analytics/AnalyticsKpiCard";
import type { AnalyticsKpi } from "@/types/analytics";

export default function ReportSummaryCards({ data }: { data: AnalyticsKpi[] }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{data.map((kpi) => <AnalyticsKpiCard key={kpi.label} kpi={kpi} />)}</div>;
}
