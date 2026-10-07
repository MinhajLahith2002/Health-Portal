import type { AnalyticsDashboardData, AnalyticsPeriod } from "@/types/analytics";

export const analyticsPeriods: { label: string; value: AnalyticsPeriod }[] = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
];

const baseData: AnalyticsDashboardData = {
  kpis: [
    { label: "Total Patients", value: "1,248", change: "+12.5%", direction: "up", comparison: "vs previous month", icon: "P", accent: "blue" },
    { label: "Total Appointments", value: "426", change: "+8.2%", direction: "up", comparison: "vs previous month", icon: "A", accent: "violet" },
    { label: "Total Consultations", value: "318", change: "+6.4%", direction: "up", comparison: "vs previous month", icon: "C", accent: "teal" },
    { label: "Total Revenue", value: "Rs. 2.84M", change: "+14.8%", direction: "up", comparison: "vs previous month", icon: "R", accent: "amber" },
    { label: "Lab Tests", value: "892", change: "-3.1%", direction: "down", comparison: "vs previous month", icon: "L", accent: "rose" },
    { label: "Insurance Claims", value: "164", change: "+4.7%", direction: "up", comparison: "vs previous month", icon: "I", accent: "green" },
  ],
  patientTrends: [
    { month: "Jan", patients: 840 }, { month: "Feb", patients: 910 }, { month: "Mar", patients: 980 },
    { month: "Apr", patients: 1050 }, { month: "May", patients: 1150 }, { month: "Jun", patients: 1248 },
  ],
  revenue: [
    { month: "Jan", revenue: 1.72 }, { month: "Feb", revenue: 1.94 }, { month: "Mar", revenue: 2.08 },
    { month: "Apr", revenue: 2.35 }, { month: "May", revenue: 2.56 }, { month: "Jun", revenue: 2.84 },
  ],
  resources: [
    { resource: "Beds", utilization: 78, capacity: 100 }, { resource: "Staff", utilization: 86, capacity: 100 },
    { resource: "Equipment", utilization: 64, capacity: 100 }, { resource: "Laboratory", utilization: 72, capacity: 100 },
  ],
  departments: [
    { department: "Emergency", patients: 284, appointments: 96, utilization: 91, revenue: 0.68, status: "Attention" },
    { department: "Cardiology", patients: 196, appointments: 72, utilization: 78, revenue: 0.54, status: "Healthy" },
    { department: "General Medicine", patients: 342, appointments: 128, utilization: 74, revenue: 0.46, status: "Healthy" },
    { department: "Pediatrics", patients: 218, appointments: 84, utilization: 68, revenue: 0.32, status: "Watch" },
    { department: "Laboratory", patients: 208, appointments: 46, utilization: 82, revenue: 0.84, status: "Healthy" },
  ],
};

export const analyticsMockData: Record<AnalyticsPeriod, AnalyticsDashboardData> = {
  today: baseData,
  week: baseData,
  month: baseData,
  year: {
    ...baseData,
    kpis: baseData.kpis.map((kpi) => ({ ...kpi, comparison: "vs previous year" })),
    patientTrends: baseData.patientTrends.map((point) => ({ ...point, patients: point.patients * 8 })),
    revenue: baseData.revenue.map((point) => ({ ...point, revenue: point.revenue * 8.7 })),
  },
};