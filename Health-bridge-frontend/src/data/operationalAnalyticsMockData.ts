import type { AnalyticsKpi, OperationalAnalyticsByPeriod, OperationalAnalyticsData } from "@/types/analytics";

const baseKpis: AnalyticsKpi[] = [
  { label: "Bed Occupancy", value: "78%", change: "+4.2%", direction: "up", trendImpact: "neutral", comparison: "vs previous period", icon: "H", accent: "blue" },
  { label: "Staff Utilization", value: "86%", change: "+3.6%", direction: "up", trendImpact: "negative", comparison: "vs previous period", icon: "P", accent: "violet" },
  { label: "Equipment Utilization", value: "64%", change: "+2.8%", direction: "up", trendImpact: "positive", comparison: "vs previous period", icon: "I", accent: "teal" },
  { label: "Average Wait Time", value: "18 min", change: "-9.1%", direction: "down", trendImpact: "positive", comparison: "vs previous period", icon: "C", accent: "green" },
  { label: "Appointment Completion", value: "87.6%", change: "+3.1%", direction: "up", trendImpact: "positive", comparison: "vs previous period", icon: "A", accent: "amber" },
  { label: "Lab Turnaround Time", value: "4.2 hrs", change: "-6.7%", direction: "down", trendImpact: "positive", comparison: "vs previous period", icon: "L", accent: "rose" },
];

const baseData: OperationalAnalyticsData = {
  kpis: baseKpis,
  resourceTrend: [
    { month: "Jan", beds: 70, staff: 80, equipment: 58, laboratory: 66 }, { month: "Feb", beds: 72, staff: 82, equipment: 60, laboratory: 68 },
    { month: "Mar", beds: 74, staff: 83, equipment: 61, laboratory: 70 }, { month: "Apr", beds: 76, staff: 84, equipment: 62, laboratory: 72 },
    { month: "May", beds: 77, staff: 85, equipment: 63, laboratory: 74 }, { month: "Jun", beds: 78, staff: 86, equipment: 64, laboratory: 76 },
  ],
  bedOccupancy: [
    { department: "Emergency", occupancy: 91, status: "Critical" }, { department: "Cardiology", occupancy: 78, status: "Watch" },
    { department: "General Medicine", occupancy: 74, status: "Healthy" }, { department: "Pediatrics", occupancy: 68, status: "Healthy" }, { department: "ICU", occupancy: 88, status: "Watch" },
  ],
  staffUtilization: [
    { category: "Doctors", available: 48, active: 42, utilization: 88 }, { category: "Nurses", available: 96, active: 84, utilization: 88 },
    { category: "Laboratory Staff", available: 32, active: 25, utilization: 78 }, { category: "Pharmacy Staff", available: 24, active: 18, utilization: 75 },
    { category: "Administrative Staff", available: 38, active: 27, utilization: 71 },
  ],
  patientFlow: [
    { month: "Jan", admissions: 286, discharges: 264, emergencyVisits: 198 }, { month: "Feb", admissions: 302, discharges: 278, emergencyVisits: 214 },
    { month: "Mar", admissions: 318, discharges: 296, emergencyVisits: 226 }, { month: "Apr", admissions: 326, discharges: 304, emergencyVisits: 238 },
    { month: "May", admissions: 342, discharges: 318, emergencyVisits: 246 }, { month: "Jun", admissions: 356, discharges: 334, emergencyVisits: 258 },
  ],
  appointmentEfficiency: [
    { month: "Jan", scheduled: 352, completed: 296, cancelled: 28, noShow: 28, averageWait: 24, onTimeRate: 76 }, { month: "Feb", scheduled: 374, completed: 314, cancelled: 31, noShow: 29, averageWait: 23, onTimeRate: 78 },
    { month: "Mar", scheduled: 398, completed: 336, cancelled: 30, noShow: 32, averageWait: 22, onTimeRate: 80 }, { month: "Apr", scheduled: 416, completed: 354, cancelled: 29, noShow: 33, averageWait: 21, onTimeRate: 82 },
    { month: "May", scheduled: 438, completed: 376, cancelled: 30, noShow: 32, averageWait: 19, onTimeRate: 85 }, { month: "Jun", scheduled: 462, completed: 404, cancelled: 27, noShow: 31, averageWait: 18, onTimeRate: 87 },
  ],
  labPerformance: [
    { month: "Jan", testsReceived: 720, completedTests: 664, pendingTests: 56, criticalResults: 24, averageTurnaround: 5.4 }, { month: "Feb", testsReceived: 756, completedTests: 702, pendingTests: 54, criticalResults: 27, averageTurnaround: 5.1 },
    { month: "Mar", testsReceived: 782, completedTests: 732, pendingTests: 50, criticalResults: 29, averageTurnaround: 4.9 }, { month: "Apr", testsReceived: 814, completedTests: 768, pendingTests: 46, criticalResults: 31, averageTurnaround: 4.6 },
    { month: "May", testsReceived: 856, completedTests: 814, pendingTests: 42, criticalResults: 34, averageTurnaround: 4.4 }, { month: "Jun", testsReceived: 892, completedTests: 850, pendingTests: 42, criticalResults: 36, averageTurnaround: 4.2 },
  ],
  capacityStatus: [
    { resource: "Beds", utilization: 78, target: 80, status: "Healthy" }, { resource: "Staff", utilization: 86, target: 85, status: "Watch" },
    { resource: "Equipment", utilization: 64, target: 75, status: "Healthy" }, { resource: "Laboratory", utilization: 76, target: 80, status: "Healthy" },
  ],
  performance: [
    { department: "Emergency", bedOccupancy: 91, staffUtilization: 94, averageWait: 26, appointmentCompletion: 83, labTurnaround: 4.8, status: "Capacity Pressure" },
    { department: "Cardiology", bedOccupancy: 78, staffUtilization: 86, averageWait: 17, appointmentCompletion: 91, labTurnaround: 4.1, status: "Watch" },
    { department: "General Medicine", bedOccupancy: 74, staffUtilization: 82, averageWait: 16, appointmentCompletion: 88, labTurnaround: 4.0, status: "Healthy" },
    { department: "Pediatrics", bedOccupancy: 68, staffUtilization: 76, averageWait: 14, appointmentCompletion: 86, labTurnaround: 3.8, status: "Healthy" },
    { department: "Laboratory", bedOccupancy: 72, staffUtilization: 78, averageWait: 12, appointmentCompletion: 94, labTurnaround: 4.2, status: "Healthy" },
  ],
};

const scaleData = (data: OperationalAnalyticsData, factor: number, comparison: string): OperationalAnalyticsData => ({
  ...data,
  kpis: data.kpis.map((kpi) => ({ ...kpi, comparison })),
  patientFlow: data.patientFlow.map((point) => ({ ...point, admissions: Math.round(point.admissions * factor), discharges: Math.round(point.discharges * factor), emergencyVisits: Math.round(point.emergencyVisits * factor) })),
  appointmentEfficiency: data.appointmentEfficiency.map((point) => ({ ...point, scheduled: Math.round(point.scheduled * factor), completed: Math.round(point.completed * factor), cancelled: Math.round(point.cancelled * factor), noShow: Math.round(point.noShow * factor) })),
  labPerformance: data.labPerformance.map((point) => ({ ...point, testsReceived: Math.round(point.testsReceived * factor), completedTests: Math.round(point.completedTests * factor), pendingTests: Math.round(point.pendingTests * factor), criticalResults: Math.round(point.criticalResults * factor) })),
});

export const operationalAnalyticsMockData: OperationalAnalyticsByPeriod = {
  today: baseData,
  week: scaleData(baseData, 0.42, "vs previous week"),
  month: baseData,
  year: scaleData(baseData, 8.7, "vs previous year"),
};
