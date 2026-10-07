import type { AnalyticsKpi, AnalyticsReport, ReportActivityPoint, ReportCategory, ReportPeriod, ReportStatus, ScheduledAnalyticsReport } from "@/types/analytics";

export const reportSummaryKpis: AnalyticsKpi[] = [
  { label: "Reports Generated", value: "128", change: "+12.5%", direction: "up", trendImpact: "positive", comparison: "vs previous month", icon: "D", accent: "blue" },
  { label: "Scheduled Reports", value: "14", change: "+2", direction: "up", trendImpact: "positive", comparison: "vs previous month", icon: "A", accent: "violet" },
  { label: "Reports This Month", value: "32", change: "+8.3%", direction: "up", trendImpact: "positive", comparison: "vs previous month", icon: "C", accent: "teal" },
  { label: "Pending Reports", value: "3", change: "-25%", direction: "down", trendImpact: "positive", comparison: "vs previous month", icon: "L", accent: "amber" },
];

export const reportCategories: { category: ReportCategory; description: string; lastGenerated: string; icon: string }[] = [
  { category: "Healthcare", description: "Patient activity and clinical service performance.", lastGenerated: "Today, 10:42 AM", icon: "H" },
  { category: "Financial", description: "Revenue, payment activity, and financial trends.", lastGenerated: "Yesterday, 4:18 PM", icon: "F" },
  { category: "Operational", description: "Capacity usage and service efficiency insights.", lastGenerated: "Jun 30, 9:05 AM", icon: "O" },
  { category: "Population Health", description: "Demographic patterns and population indicators.", lastGenerated: "Jun 28, 2:36 PM", icon: "P" },
  { category: "Hospital Performance", description: "Cross-department hospital performance overview.", lastGenerated: "Jun 27, 11:20 AM", icon: "B" },
  { category: "Laboratory Performance", description: "Testing volume and turnaround performance.", lastGenerated: "Jun 26, 3:50 PM", icon: "L" },
];

export const recentReports: AnalyticsReport[] = [
  { id: "report-1", name: "Monthly Healthcare Performance", category: "Healthcare", period: "This Month", generatedDate: "Jun 30, 2026", format: "PDF", status: "Completed", summary: "A monthly overview of patient activity, consultations, and clinical service performance.", metrics: [{ label: "Total Patients", value: "1,248" }, { label: "Appointments", value: "426" }, { label: "Completion", value: "87.6%" }, { label: "Lab Tests", value: "892" }] },
  { id: "report-2", name: "Financial Summary - June", category: "Financial", period: "This Month", generatedDate: "Jun 30, 2026", format: "Excel", status: "Completed", summary: "Revenue performance, payment activity, and outstanding financial indicators.", metrics: [{ label: "Revenue", value: "Rs. 2.84M" }, { label: "Payments Received", value: "Rs. 2.31M" }, { label: "Transactions", value: "1,842" }, { label: "Outstanding", value: "Rs. 428K" }] },
  { id: "report-3", name: "Operational Capacity Report", category: "Operational", period: "This Week", generatedDate: "Jun 28, 2026", format: "PDF", status: "Completed", summary: "Capacity utilization and operational efficiency across key resources.", metrics: [{ label: "Bed Occupancy", value: "78%" }, { label: "Staff Utilization", value: "86%" }, { label: "Average Wait", value: "18 min" }, { label: "Lab Turnaround", value: "4.2 hrs" }] },
  { id: "report-4", name: "Population Health Overview", category: "Population Health", period: "This Month", generatedDate: "Jun 27, 2026", format: "PDF", status: "Scheduled", summary: "Population trends, health risks, demographic distribution, and preventive care.", metrics: [{ label: "Population", value: "12,480" }, { label: "High Risk", value: "864" }, { label: "Chronic Rate", value: "28.4%" }, { label: "Screening Rate", value: "72.6%" }] },
  { id: "report-5", name: "Laboratory Performance Report", category: "Laboratory Performance", period: "This Month", generatedDate: "Jun 26, 2026", format: "Excel", status: "Generating", summary: "Laboratory test workflow, completion, critical results, and turnaround indicators.", metrics: [{ label: "Tests Received", value: "892" }, { label: "Completed", value: "850" }, { label: "Pending", value: "42" }, { label: "Turnaround", value: "4.2 hrs" }] },
  { id: "report-6", name: "Executive Analytics Summary", category: "Executive Summary", period: "This Quarter", generatedDate: "Jun 24, 2026", format: "PDF", status: "Completed", summary: "A concise cross-domain view of healthcare, finance, operations, and population health.", metrics: [{ label: "Patients", value: "1,248" }, { label: "Revenue", value: "Rs. 2.84M" }, { label: "Bed Occupancy", value: "78%" }, { label: "Completion", value: "87.6%" }] },
];

export const scheduledReports: ScheduledAnalyticsReport[] = [
  { id: "schedule-1", report: "Weekly Healthcare Summary", frequency: "Every Monday", nextRun: "Jul 6, 2026", status: "Active" },
  { id: "schedule-2", report: "Monthly Financial Report", frequency: "1st day of each month", nextRun: "Jul 1, 2026", status: "Active" },
  { id: "schedule-3", report: "Operational Capacity Report", frequency: "Every Friday", nextRun: "Jul 3, 2026", status: "Active" },
];

export const reportActivity: ReportActivityPoint[] = [
  { month: "Jan", healthcare: 12, financial: 8, operational: 6, populationHealth: 5 }, { month: "Feb", healthcare: 15, financial: 9, operational: 8, populationHealth: 6 },
  { month: "Mar", healthcare: 18, financial: 11, operational: 9, populationHealth: 7 }, { month: "Apr", healthcare: 20, financial: 13, operational: 11, populationHealth: 8 },
  { month: "May", healthcare: 24, financial: 15, operational: 13, populationHealth: 10 }, { month: "Jun", healthcare: 28, financial: 17, operational: 15, populationHealth: 12 },
];

export const reportTypes: { label: string; value: ReportCategory }[] = [
  { label: "Healthcare Analytics", value: "Healthcare" }, { label: "Financial Analytics", value: "Financial" }, { label: "Operational Analytics", value: "Operational" },
  { label: "Population Health", value: "Population Health" }, { label: "Hospital Performance", value: "Hospital Performance" }, { label: "Laboratory Performance", value: "Laboratory Performance" }, { label: "Executive Summary", value: "Executive Summary" },
];

export const reportPeriods: ReportPeriod[] = ["Today", "This Week", "This Month", "This Quarter", "This Year", "Custom Range"];
export const reportDepartments = ["All Departments", "Emergency", "Cardiology", "General Medicine", "Pediatrics", "Laboratory"];
export const reportStatusOrder: ReportStatus[] = ["Completed", "Generating", "Failed", "Scheduled"];
