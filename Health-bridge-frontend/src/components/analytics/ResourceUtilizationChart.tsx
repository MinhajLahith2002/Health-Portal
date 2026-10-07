"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ResourceUtilizationPoint } from "@/types/analytics";

const colors = ["#2563eb", "#7c3aed", "#f59e0b", "#0d9488"];

export default function ResourceUtilizationChart({ data }: { data: ResourceUtilizationPoint[] }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
      <div className="h-52 w-52 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="utilization" nameKey="resource" innerRadius={58} outerRadius={82} paddingAngle={4} stroke="none">
              {data.map((entry, index) => <Cell key={entry.resource} fill={colors[index % colors.length]} />)}
            </Pie>
            <Tooltip formatter={(value: unknown) => [`${Number(value ?? 0)}%`, "Utilization"]} contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid w-full grid-cols-2 gap-x-4 gap-y-3 sm:block sm:w-auto sm:space-y-3">
        {data.map((item, index) => <div key={item.resource} className="flex items-center justify-between gap-3 text-xs sm:justify-start"><span className="flex items-center gap-2 text-slate-500"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />{item.resource}</span><strong className="text-slate-800">{item.utilization}%</strong></div>)}
      </div>
    </div>
  );
}