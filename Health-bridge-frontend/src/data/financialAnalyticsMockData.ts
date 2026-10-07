import type { AnalyticsKpi, FinancialAnalyticsByPeriod, FinancialAnalyticsData } from "@/types/analytics";

const baseKpis: AnalyticsKpi[] = [
  { label: "Total Revenue", value: "Rs. 2.84M", change: "+14.8%", direction: "up", comparison: "vs previous month", icon: "R", accent: "blue" },
  { label: "Payments Received", value: "Rs. 2.31M", change: "+11.6%", direction: "up", comparison: "vs previous month", icon: "C", accent: "green" },
  { label: "Outstanding Amount", value: "Rs. 428K", change: "-6.2%", direction: "down", trendPositive: true, comparison: "vs previous month", icon: "L", accent: "amber" },
  { label: "Insurance Revenue", value: "Rs. 684K", change: "+9.4%", direction: "up", comparison: "vs previous month", icon: "I", accent: "violet" },
  { label: "Total Transactions", value: "1,842", change: "+8.7%", direction: "up", comparison: "vs previous month", icon: "A", accent: "teal" },
  { label: "Refunds", value: "Rs. 72K", change: "-2.8%", direction: "down", trendPositive: true, comparison: "vs previous month", icon: "C", accent: "rose" },
];

const baseData: FinancialAnalyticsData = {
  kpis: baseKpis,
  revenueTrend: [
    { month: "Jan", revenue: 1.72, previousRevenue: 1.58 }, { month: "Feb", revenue: 1.94, previousRevenue: 1.76 },
    { month: "Mar", revenue: 2.08, previousRevenue: 1.91 }, { month: "Apr", revenue: 2.35, previousRevenue: 2.04 },
    { month: "May", revenue: 2.56, previousRevenue: 2.25 }, { month: "Jun", revenue: 2.84, previousRevenue: 2.48 },
  ],
  revenueBySource: [
    { source: "Consultations", value: 0.72, percentage: 25.4 }, { source: "Hospital Services", value: 0.58, percentage: 20.4 },
    { source: "Laboratory", value: 0.46, percentage: 16.2 }, { source: "Pharmacy", value: 0.38, percentage: 13.4 },
    { source: "Insurance", value: 0.44, percentage: 15.5 }, { source: "Telemedicine", value: 0.26, percentage: 9.1 },
  ],
  paymentStatus: [
    { status: "Paid", count: 1420, value: 2.31 }, { status: "Pending", count: 248, value: 0.428 },
    { status: "Failed", count: 92, value: 0.061 }, { status: "Refunded", count: 82, value: 0.072 },
  ],
  transactionActivity: [
    { month: "Jan", successful: 1080, pending: 190, failed: 66, refunds: 54 }, { month: "Feb", successful: 1148, pending: 204, failed: 72, refunds: 58 },
    { month: "Mar", successful: 1204, pending: 216, failed: 74, refunds: 63 }, { month: "Apr", successful: 1286, pending: 228, failed: 81, refunds: 68 },
    { month: "May", successful: 1368, pending: 238, failed: 86, refunds: 74 }, { month: "Jun", successful: 1420, pending: 248, failed: 92, refunds: 82 },
  ],
  departmentRevenue: [
    { department: "Emergency", revenue: 0.68 }, { department: "Cardiology", revenue: 0.54 }, { department: "General Medicine", revenue: 0.46 },
    { department: "Pediatrics", revenue: 0.32 }, { department: "Laboratory", revenue: 0.84 },
  ],
  revenueGrowth: [
    { source: "Consultations", growth: 12.4 }, { source: "Laboratory", growth: 9.8 }, { source: "Pharmacy", growth: 7.2 },
    { source: "Insurance", growth: 5.6 }, { source: "Telemedicine", growth: 14.1 },
  ],
  performance: [
    { source: "Consultations", transactions: 524, revenue: 0.72, pending: 48, growth: 12.4, status: "Strong" },
    { source: "Hospital Services", transactions: 318, revenue: 0.58, pending: 62, growth: 8.1, status: "Stable" },
    { source: "Laboratory", transactions: 286, revenue: 0.46, pending: 31, growth: 9.8, status: "Strong" },
    { source: "Pharmacy", transactions: 402, revenue: 0.38, pending: 54, growth: 7.2, status: "Watch" },
    { source: "Insurance", transactions: 230, revenue: 0.44, pending: 53, growth: 5.6, status: "Attention" },
  ],
};

const scaleData = (data: FinancialAnalyticsData, factor: number, comparison: string): FinancialAnalyticsData => ({
  ...data,
  kpis: data.kpis.map((kpi) => ({ ...kpi, comparison })),
  revenueTrend: data.revenueTrend.map((point) => ({ ...point, revenue: point.revenue * factor, previousRevenue: point.previousRevenue * factor })),
  paymentStatus: data.paymentStatus.map((point) => ({ ...point, count: Math.round(point.count * factor), value: point.value * factor })),
  transactionActivity: data.transactionActivity.map((point) => ({ ...point, successful: Math.round(point.successful * factor), pending: Math.round(point.pending * factor), failed: Math.round(point.failed * factor), refunds: Math.round(point.refunds * factor) })),
  departmentRevenue: data.departmentRevenue.map((point) => ({ ...point, revenue: point.revenue * factor })),
  performance: data.performance.map((point) => ({ ...point, transactions: Math.round(point.transactions * factor), revenue: point.revenue * factor, pending: Math.round(point.pending * factor) })),
});

export const financialAnalyticsMockData: FinancialAnalyticsByPeriod = {
  today: baseData,
  week: scaleData(baseData, 0.42, "vs previous week"),
  month: baseData,
  year: scaleData(baseData, 8.7, "vs previous year"),
};
