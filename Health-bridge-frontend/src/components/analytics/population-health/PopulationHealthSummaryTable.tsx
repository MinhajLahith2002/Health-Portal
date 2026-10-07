import type { PopulationHealthSummaryDto } from "@/types/analytics";

export default function PopulationHealthSummaryTable({ data }: { data: PopulationHealthSummaryDto }) {
  const rows = [["Registered patient accounts", data.registeredPatientAccounts], ["New patient accounts", data.newPatientAccounts], ["Valid age records", data.validAgeRecords], ["Valid gender records", data.validGenderRecords], ["Valid blood-group records", data.validBloodGroupRecords], ["Published lab results", data.publishedLabResults], ["Abnormal lab results", data.abnormalLabResults], ["Critical lab results", data.criticalLabResults]];
  return <div><div className="divide-y divide-slate-100">{rows.map(([label, value]) => <div key={label} className="flex items-center justify-between gap-4 py-3 text-sm"><span className="text-slate-500">{label}</span><strong className="text-slate-800">{Number(value).toLocaleString()}</strong></div>)}</div><p className="mt-3 text-xs text-slate-400">{data.limitation}</p></div>;
}
