export type AnalyticsPeriod = "today" | "week" | "month" | "year";

export type TrendDirection = "up" | "down";
export type TrendImpact = "positive" | "negative" | "neutral";

export type AnalyticsKpi = {
  label: string;
  value: string;
  change?: string;
  direction?: TrendDirection;
  trendPositive?: boolean;
  trendImpact?: TrendImpact;
  comparison?: string;
  icon: string;
  accent: string;
};

export type PatientTrendPoint = {
  month: string;
  patients: number;
};

export type RevenuePoint = {
  month: string;
  revenue: number;
};

export type ResourceUtilizationPoint = {
  resource: string;
  utilization: number;
  capacity?: number;
};

export type DepartmentPerformancePoint = {
  department: string;
  performance: number;
};

export type DepartmentPerformance = {
  department: string;
  patients: number;
  appointments: number;
  utilization: number;
  revenue: number;
  status: string;
};

export type AnalyticsDashboardData = {
  kpis: AnalyticsKpi[];
  patientTrends: PatientTrendPoint[];
  revenue: RevenuePoint[];
  resources: ResourceUtilizationPoint[];
  departments: DepartmentPerformance[];
};

export type FinancialRevenueSource = {
  source: string;
  value: number;
  percentage: number;
};

export type FinancialPaymentStatus = {
  status: "Paid" | "Pending" | "Failed" | "Refunded";
  count: number;
  value: number;
};

export type FinancialRevenueTrendPoint = {
  month: string;
  revenue: number;
  previousRevenue: number;
};

export type FinancialTransactionPoint = {
  month: string;
  successful: number;
  pending: number;
  failed: number;
  refunds: number;
};

export type FinancialDepartmentRevenue = {
  department: string;
  revenue: number;
};

export type FinancialRevenueGrowth = {
  source: string;
  growth: number;
};

export type FinancialPerformanceRow = {
  source: string;
  transactions: number;
  revenue: number;
  pending: number;
  growth: number;
  status: "Strong" | "Stable" | "Watch" | "Attention";
};

export type FinancialAnalyticsData = {
  kpis: AnalyticsKpi[];
  revenueTrend: FinancialRevenueTrendPoint[];
  revenueBySource: FinancialRevenueSource[];
  paymentStatus: FinancialPaymentStatus[];
  transactionActivity: FinancialTransactionPoint[];
  departmentRevenue: FinancialDepartmentRevenue[];
  revenueGrowth: FinancialRevenueGrowth[];
  performance: FinancialPerformanceRow[];
};

export type FinancialAnalyticsByPeriod = Record<AnalyticsPeriod, FinancialAnalyticsData>;

export type FinancialKpiResponseDto = {
  name: string;
  value: number | null;
  status: AnalyticsDataAvailability;
  definition: string | null;
  reason: string | null;
};

export type FinancialRevenueTrendPointDto = {
  periodLabel: string;
  billedRevenue: number;
  invoiceCount: number;
};

export type FinancialRevenueSourceDto = {
  category: string;
  billedAmount: number;
  billingItemCount: number;
};

export type FinancialRevenueBySourceDto = {
  status: AnalyticsDataAvailability;
  sources: FinancialRevenueSourceDto[];
  totalBillingItems: number;
  categorizedBillingItems: number;
  uncategorizedBillingItems: number;
  note: string;
};

export type FinancialStatusResponseDto = {
  status: "DRAFT" | "ISSUED" | "CANCELLED" | "UNPAID" | "PARTIALLY_PAID" | "PAID";
  count: number;
  dataAvailability: AnalyticsDataAvailability;
};

export type FinancialSummaryDto = {
  status: AnalyticsDataAvailability;
  invoiceCount: number;
  billedRevenue: number;
  paidInvoiceCount: number;
  unpaidInvoiceCount: number;
  partiallyPaidInvoiceCount: number;
  knownUnpaidInvoiceAmount: number;
  limitation: string;
};

export type FinancialMetricAvailabilityDto = {
  metric: string;
  status: AnalyticsDataAvailability;
  reason: string | null;
  definition: string | null;
};

export type FinancialAnalyticsResponseDto = {
  generatedAt: string;
  period: AnalyticsPeriod;
  dataAvailability: AnalyticsDataAvailability;
  kpis: FinancialKpiResponseDto[];
  revenueTrend: FinancialRevenueTrendPointDto[];
  revenueBySource: FinancialRevenueBySourceDto;
  invoiceStatus: FinancialStatusResponseDto[];
  paymentStatus: FinancialStatusResponseDto[];
  financialSummary: FinancialSummaryDto;
  availability: FinancialMetricAvailabilityDto[];
};

export type OperationalResourceTrendPoint = {
  month: string;
  beds: number;
  staff: number;
  equipment: number;
  laboratory: number;
};

export type OperationalBedOccupancy = {
  department: string;
  occupancy: number;
  status: "Healthy" | "Watch" | "Critical";
};

export type OperationalStaffUtilization = {
  category: string;
  available: number;
  active: number;
  utilization: number;
};

export type OperationalPatientFlowPoint = {
  month: string;
  admissions: number;
  discharges: number;
  emergencyVisits: number;
};

export type OperationalAppointmentEfficiency = {
  month: string;
  scheduled: number;
  completed: number;
  cancelled: number;
  noShow: number;
  averageWait: number;
  onTimeRate: number;
};

export type OperationalLabPerformance = {
  month: string;
  testsReceived: number;
  completedTests: number;
  pendingTests: number;
  criticalResults: number;
  averageTurnaround: number;
};

export type OperationalCapacityStatus = {
  resource: string;
  utilization: number;
  target: number;
  status: "Healthy" | "Watch" | "Capacity Pressure";
};

export type OperationalPerformanceRow = {
  department: string;
  bedOccupancy: number;
  staffUtilization: number;
  averageWait: number;
  appointmentCompletion: number;
  labTurnaround: number;
  status: "Healthy" | "Watch" | "Attention" | "Capacity Pressure";
};

export type OperationalAnalyticsData = {
  kpis: AnalyticsKpi[];
  resourceTrend: OperationalResourceTrendPoint[];
  bedOccupancy: OperationalBedOccupancy[];
  staffUtilization: OperationalStaffUtilization[];
  patientFlow: OperationalPatientFlowPoint[];
  appointmentEfficiency: OperationalAppointmentEfficiency[];
  labPerformance: OperationalLabPerformance[];
  capacityStatus: OperationalCapacityStatus[];
  performance: OperationalPerformanceRow[];
};

export type OperationalAnalyticsByPeriod = Record<AnalyticsPeriod, OperationalAnalyticsData>;

export type OperationalKpiResponseDto = {
  name: string;
  value: number | null;
  unit: string;
  status: AnalyticsDataAvailability;
  definition: string | null;
  reason: string | null;
};

export type OperationalInventoryStatusDto = {
  status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "EXPIRED";
  count: number;
};

export type OperationalInventorySummaryDto = {
  status: AnalyticsDataAvailability;
  totalItems: number;
  statusBreakdown: OperationalInventoryStatusDto[];
  inventoryValue: number;
  validValueRecords: number;
  excludedValueRecords: number;
  definition: string;
};

export type OperationalLabStatusCountDto = {
  status: string;
  count: number;
};

export type OperationalLaboratoryOperationsDto = {
  status: AnalyticsDataAvailability;
  totalOrders: number;
  eligibleOrders: number;
  completedOrders: number;
  completionRate: number;
  orderStatus: OperationalLabStatusCountDto[];
  sampleStatus: OperationalLabStatusCountDto[];
  linkedSamples: number;
  orderDefinition: string;
  sampleDefinition: string;
};

export type OperationalLabTurnaroundDto = {
  status: AnalyticsDataAvailability;
  averageHours: number;
  eligibleRecords: number;
  validRecords: number;
  excludedRecords: number;
  definition: string;
};

export type OperationalResourceAvailabilityDto = {
  resource: string;
  status: AnalyticsDataAvailability;
  workloadCount: number | null;
  workloadUnit: string | null;
  reason: string | null;
  definition: string | null;
};

export type OperationalMetricAvailabilityDto = {
  metric: string;
  status: AnalyticsDataAvailability;
  reason: string | null;
  definition: string | null;
};

export type OperationalSummaryDto = {
  status: AnalyticsDataAvailability;
  inventoryItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  laboratoryOrders: number;
  laboratoryCompletionRate: number;
  averageLaboratoryTurnaroundHours: number;
  turnaroundValidRecords: number;
  departmentPerformance: OperationalMetricAvailabilityDto;
};

export type OperationalAnalyticsResponseDto = {
  generatedAt: string;
  period: AnalyticsPeriod;
  dataAvailability: AnalyticsDataAvailability;
  kpis: OperationalKpiResponseDto[];
  inventorySummary: OperationalInventorySummaryDto;
  laboratoryOperations: OperationalLaboratoryOperationsDto;
  labTurnaround: OperationalLabTurnaroundDto;
  resourceAvailability: OperationalResourceAvailabilityDto[];
  patientFlow: OperationalMetricAvailabilityDto;
  appointmentEfficiency: OperationalMetricAvailabilityDto;
  departmentPerformance: OperationalMetricAvailabilityDto;
  operationalSummary: OperationalSummaryDto;
  availability: OperationalMetricAvailabilityDto[];
};

export type PopulationGrowthPoint = {
  month: string;
  totalPopulation: number;
  newPatients: number;
};

export type PopulationDistributionPoint = {
  label: string;
  count: number;
  percentage: number;
};

export type PopulationConditionPoint = {
  condition: string;
  affectedPatients: number;
  prevalence: number;
};

export type PopulationRiskPoint = {
  risk: "Low Risk" | "Moderate Risk" | "High Risk";
  count: number;
  percentage: number;
};

export type PopulationUtilizationPoint = {
  ageGroup: string;
  appointments: number;
  consultations: number;
  labTests: number;
};

export type RegionalHealthPoint = {
  region: string;
  registeredPatients: number;
  highRiskRate: number;
  screeningRate: number;
};

export type PreventiveCarePoint = {
  month: string;
  screenings: number;
  routineCheckups: number;
  followUpCompletion: number;
};

export type PopulationHealthSummaryRow = {
  populationGroup: string;
  patients: number;
  highRisk: number;
  chronicConditions: number;
  screeningRate: number;
  healthcareUtilization: number;
  status: "Healthy" | "Stable" | "Watch" | "Attention";
};

export type PopulationHealthAnalyticsData = {
  kpis: AnalyticsKpi[];
  populationGrowth: PopulationGrowthPoint[];
  ageDistribution: PopulationDistributionPoint[];
  genderDistribution: PopulationDistributionPoint[];
  commonConditions: PopulationConditionPoint[];
  healthRisk: PopulationRiskPoint[];
  utilizationByAge: PopulationUtilizationPoint[];
  regionalPatterns: RegionalHealthPoint[];
  preventiveCare: PreventiveCarePoint[];
  summary: PopulationHealthSummaryRow[];
};

export type PopulationHealthAnalyticsByPeriod = Record<AnalyticsPeriod, PopulationHealthAnalyticsData>;

export type PopulationHealthKpiResponseDto = {
  name: string;
  value: number | null;
  status: AnalyticsDataAvailability;
  definition: string | null;
  reason: string | null;
};

export type PopulationGrowthResponseDto = {
  periodLabel: string;
  newPatientAccounts: number;
  totalPatientAccounts: number;
};

export type PopulationAgeBucketDto = { ageGroup: string; count: number };
export type PopulationGenderBucketDto = { gender: string; count: number };
export type PopulationBloodGroupBucketDto = { bloodGroup: string; count: number };

export type PopulationAgeDistributionDto = {
  status: AnalyticsDataAvailability;
  distribution: PopulationAgeBucketDto[];
  totalPatientAccounts: number;
  validRecords: number;
  excludedRecords: number;
  note: string;
};

export type PopulationGenderDistributionDto = {
  status: AnalyticsDataAvailability;
  distribution: PopulationGenderBucketDto[];
  totalPatientAccounts: number;
  validRecords: number;
  unknownRecords: number;
  note: string;
};

export type PopulationBloodGroupDistributionDto = {
  status: AnalyticsDataAvailability;
  distribution: PopulationBloodGroupBucketDto[];
  totalPatientAccounts: number;
  validRecords: number;
  unknownRecords: number;
  note: string;
};

export type PopulationLabHealthIndicatorsDto = {
  status: AnalyticsDataAvailability;
  publishedResults: number;
  abnormalResults: number;
  criticalResults: number;
  abnormalResultPercentage: number;
  criticalResultPercentage: number;
  denominator: string;
  limitation: string;
};

export type PopulationMetricAvailabilityDto = {
  metric: string;
  status: AnalyticsDataAvailability;
  reason: string | null;
  definition: string | null;
};

export type PopulationHealthSummaryDto = {
  status: AnalyticsDataAvailability;
  registeredPatientAccounts: number;
  newPatientAccounts: number;
  validAgeRecords: number;
  validGenderRecords: number;
  validBloodGroupRecords: number;
  publishedLabResults: number;
  abnormalLabResults: number;
  criticalLabResults: number;
  limitation: string;
};

export type PopulationHealthAnalyticsResponseDto = {
  generatedAt: string;
  period: AnalyticsPeriod;
  dataAvailability: AnalyticsDataAvailability;
  kpis: PopulationHealthKpiResponseDto[];
  populationGrowth: PopulationGrowthResponseDto[];
  ageDistribution: PopulationAgeDistributionDto;
  genderDistribution: PopulationGenderDistributionDto;
  bloodGroupDistribution: PopulationBloodGroupDistributionDto;
  labHealthIndicators: PopulationLabHealthIndicatorsDto;
  commonConditions: PopulationMetricAvailabilityDto;
  healthRisk: PopulationMetricAvailabilityDto;
  healthcareUtilizationByAge: PopulationMetricAvailabilityDto;
  regionalPatterns: PopulationMetricAvailabilityDto;
  preventiveCare: PopulationMetricAvailabilityDto;
  populationHealthSummary: PopulationHealthSummaryDto;
  availability: PopulationMetricAvailabilityDto[];
};

export type ReportsAnalyticsKpiDTO = {
  label: string;
  value: number | null;
  reason?: string | null;
};

export type ReportSummaryDTO = {
  reportId: string;
  title: string;
  category: string;
  reportType: string;
  status: string;
  generatedDate: string;
  format: string;
};

export type ReportActivityDTO = {
  date: string;
  generatedReports: number;
  exportedReports: number;
};

export type CategoryDistributionDTO = {
  category: string;
  count: number;
};

export type ScheduledReportDTO = {
  name: string;
  frequency: string;
  nextRun: string;
  status: string;
};

export type ReportsAvailabilityDTO = {
  dataSource: string;
  status: string;
  reason?: string | null;
};

export type ReportsAnalyticsResponseDTO = {
  generatedAt: string;
  period: AnalyticsPeriod;
  dataAvailability: AnalyticsDataAvailability;
  kpis: ReportsAnalyticsKpiDTO[];
  reports: ReportSummaryDTO[];
  reportActivity: ReportActivityDTO[];
  categoryDistribution: CategoryDistributionDTO[];
  scheduledReports: ScheduledReportDTO[];
  availability: ReportsAvailabilityDTO[];
};

export type ReportCategory = "Healthcare" | "Financial" | "Operational" | "Population Health" | "Hospital Performance" | "Laboratory Performance" | "Executive Summary";
export type ReportFormat = "PDF" | "Excel";
export type ReportStatus = "Completed" | "Generating" | "Failed" | "Scheduled";
export type ReportPeriod = "Today" | "This Week" | "This Month" | "This Quarter" | "This Year" | "Custom Range";

export type AnalyticsReport = {
  id: string;
  name: string;
  category: ReportCategory;
  period: ReportPeriod;
  generatedDate: string;
  format: ReportFormat;
  status: ReportStatus;
  summary: string;
  metrics: { label: string; value: string }[];
};

export type ScheduledAnalyticsReport = {
  id: string;
  report: string;
  frequency: string;
  nextRun: string;
  status: "Active" | "Paused";
};

export type ReportActivityPoint = {
  month: string;
  healthcare: number;
  financial: number;
  operational: number;
  populationHealth: number;
};

export type AnalyticsDashboardPresentation = {
  kpis: AnalyticsKpi[];
  patientTrends: PatientTrendPoint[];
  revenue: RevenuePoint[];
  resources: ResourceUtilizationPoint[];
  departmentPerformance: DepartmentPerformancePoint[];
  operationalSummary: DepartmentPerformance[];
};

export type AnalyticsDataAvailability = "LIVE" | "PARTIAL" | "UNAVAILABLE" | "MOCK";

export type AnalyticsKpiDto = { label: string; value: number };
export type PatientTrendDto = { month: string; patients: number };
export type RevenueTrendDto = { month: string; revenue: number };
export type ResourceUtilizationDto = { resource: string; utilization: number };
export type DepartmentPerformanceDto = { department: string; performance: number };
export type DashboardOperationalSummaryDto = {
  department: string;
  patients: number;
  appointments: number;
  utilization: number;
  revenue: number;
  status: string;
};

export type AnalyticsDashboardResponseDto = {
  generatedAt: string;
  period: string;
  dataAvailability: AnalyticsDataAvailability;
  kpis: AnalyticsKpiDto[];
  patientTrends: PatientTrendDto[];
  revenueTrend: RevenueTrendDto[];
  resourceUtilization: ResourceUtilizationDto[];
  departmentPerformance: DepartmentPerformanceDto[];
  operationalSummary: DashboardOperationalSummaryDto[];
};
