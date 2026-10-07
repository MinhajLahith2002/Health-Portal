import type { AnalyticsDataAvailability, AnalyticsKpi, AnalyticsPeriod } from "@/types/analytics";

export type HealthcarePatientGrowthPoint = {
  month: string;
  totalPatients: number;
  newPatients: number;
};

export type AppointmentAnalyticsPoint = {
  month: string;
  booked: number;
  completed: number;
  cancelled: number;
  noShow: number;
  consultations: number;
};

export type ClinicalActivityPoint = {
  month: string;
  labTests: number;
  prescriptions: number;
  telemedicineSessions: number;
};

export type DemographicPoint = {
  label: string;
  value: number;
};

export type DepartmentHealthcareActivity = {
  department: string;
  patients: number;
  consultations: number;
  completionRate: number;
  status: "Healthy" | "Watch" | "Attention";
};

export type HealthcarePerformanceRow = {
  department: string;
  patients: number;
  appointments: number;
  consultations: number;
  completionRate: number;
  status: "Healthy" | "Watch" | "Attention";
};

export type HealthcareAnalyticsData = {
  kpis: AnalyticsKpi[];
  patientGrowth: HealthcarePatientGrowthPoint[];
  appointments: AppointmentAnalyticsPoint[];
  clinicalActivity: ClinicalActivityPoint[];
  ageGroups: DemographicPoint[];
  genderDistribution: DemographicPoint[];
  departments: DepartmentHealthcareActivity[];
  performance: HealthcarePerformanceRow[];
};

export type HealthcareAnalyticsByPeriod = Record<AnalyticsPeriod, HealthcareAnalyticsData>;

export type HealthcareKpiResponseDto = { name: string; value: number | null; status: AnalyticsDataAvailability; definition: string | null; reason: string | null };
export type PatientGrowthResponseDto = { periodLabel: string; newPatients: number; totalPatients: number };
export type LaboratoryActivityResponseDto = { status: AnalyticsDataAvailability; totalOrders: number; requested: number; sampleCollected: number; processing: number; completed: number; cancelled: number; definition: string };
export type DemographicDistributionResponseDto = { status: AnalyticsDataAvailability; distribution: { label: string; count: number }[]; totalPatientAccounts: number; validRecords: number; excludedRecords: number; note: string };
export type HealthcareMetricAvailabilityResponseDto = { metric: string; status: AnalyticsDataAvailability; reason: string | null; definition: string | null };
export type ClinicalActivityResponseDto = { status: AnalyticsDataAvailability; laboratory: LaboratoryActivityResponseDto; consultations: HealthcareMetricAvailabilityResponseDto; prescriptions: HealthcareMetricAvailabilityResponseDto; telemedicine: HealthcareMetricAvailabilityResponseDto };
export type HealthcarePerformanceSummaryResponseDto = { status: AnalyticsDataAvailability; registeredPatientAccounts: number; newRegisteredPatientAccounts: number; laboratoryTestOrders: number; departmentPerformance: HealthcareMetricAvailabilityResponseDto };
export type HealthcareAnalyticsResponseDto = { generatedAt: string; period: string; dataAvailability: AnalyticsDataAvailability; kpis: HealthcareKpiResponseDto[]; patientGrowth: PatientGrowthResponseDto[]; laboratoryActivity: LaboratoryActivityResponseDto; ageDistribution: DemographicDistributionResponseDto; genderDistribution: DemographicDistributionResponseDto; clinicalActivity: ClinicalActivityResponseDto; appointmentAnalytics: HealthcareMetricAvailabilityResponseDto; departmentActivity: HealthcareMetricAvailabilityResponseDto; performanceSummary: HealthcarePerformanceSummaryResponseDto; availability: HealthcareMetricAvailabilityResponseDto[] };
export type LaboratoryStatusPoint = { status: string; orders: number };
