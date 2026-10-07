import type { AnalyticsKpi, PopulationHealthAnalyticsByPeriod, PopulationHealthAnalyticsData } from "@/types/analytics";

const baseKpis: AnalyticsKpi[] = [
  { label: "Total Population", value: "12,480", change: "+8.4%", direction: "up", trendImpact: "positive", comparison: "vs previous period", icon: "P", accent: "blue" },
  { label: "New Patients", value: "1,248", change: "+6.8%", direction: "up", trendImpact: "positive", comparison: "vs previous period", icon: "P", accent: "violet" },
  { label: "High-Risk Patients", value: "864", change: "-3.2%", direction: "down", trendImpact: "positive", comparison: "vs previous period", icon: "I", accent: "rose" },
  { label: "Chronic Condition Rate", value: "28.4%", change: "+1.6%", direction: "up", trendImpact: "negative", comparison: "vs previous period", icon: "C", accent: "amber" },
  { label: "Preventive Screening Rate", value: "72.6%", change: "+5.4%", direction: "up", trendImpact: "positive", comparison: "vs previous period", icon: "L", accent: "green" },
  { label: "Average Age", value: "38.7 yrs", change: "+0.3%", direction: "up", trendImpact: "neutral", comparison: "vs previous period", icon: "A", accent: "teal" },
];

const baseData: PopulationHealthAnalyticsData = {
  kpis: baseKpis,
  populationGrowth: [
    { month: "Jan", totalPopulation: 10480, newPatients: 842 }, { month: "Feb", totalPopulation: 10860, newPatients: 876 },
    { month: "Mar", totalPopulation: 11240, newPatients: 914 }, { month: "Apr", totalPopulation: 11620, newPatients: 1028 },
    { month: "May", totalPopulation: 12014, newPatients: 1136 }, { month: "Jun", totalPopulation: 12480, newPatients: 1248 },
  ],
  ageDistribution: [
    { label: "0-17", count: 1872, percentage: 15 }, { label: "18-30", count: 2746, percentage: 22 },
    { label: "31-45", count: 3494, percentage: 28 }, { label: "46-60", count: 2619, percentage: 21 }, { label: "60+", count: 1749, percentage: 14 },
  ],
  genderDistribution: [
    { label: "Male", count: 5866, percentage: 47 }, { label: "Female", count: 6115, percentage: 49 }, { label: "Other", count: 499, percentage: 4 },
  ],
  commonConditions: [
    { condition: "Hypertension", affectedPatients: 1872, prevalence: 15 }, { condition: "Diabetes", affectedPatients: 1498, prevalence: 12 },
    { condition: "Respiratory Conditions", affectedPatients: 1123, prevalence: 9 }, { condition: "Cardiovascular Conditions", affectedPatients: 874, prevalence: 7 },
    { condition: "Obesity", affectedPatients: 1373, prevalence: 11 }, { condition: "Other Chronic Conditions", affectedPatients: 773, prevalence: 6 },
  ],
  healthRisk: [
    { risk: "Low Risk", count: 7488, percentage: 60 }, { risk: "Moderate Risk", count: 4120, percentage: 33 }, { risk: "High Risk", count: 872, percentage: 7 },
  ],
  utilizationByAge: [
    { ageGroup: "0-17", appointments: 420, consultations: 362, labTests: 284 }, { ageGroup: "18-30", appointments: 584, consultations: 496, labTests: 382 },
    { ageGroup: "31-45", appointments: 762, consultations: 648, labTests: 524 }, { ageGroup: "46-60", appointments: 704, consultations: 596, labTests: 618 },
    { ageGroup: "60+", appointments: 638, consultations: 542, labTests: 706 },
  ],
  regionalPatterns: [
    { region: "Colombo", registeredPatients: 3620, highRiskRate: 8.4, screeningRate: 76 }, { region: "Gampaha", registeredPatients: 2840, highRiskRate: 6.8, screeningRate: 73 },
    { region: "Kandy", registeredPatients: 2280, highRiskRate: 7.2, screeningRate: 70 }, { region: "Galle", registeredPatients: 1960, highRiskRate: 5.9, screeningRate: 75 },
    { region: "Kurunegala", registeredPatients: 1780, highRiskRate: 8.1, screeningRate: 68 },
  ],
  preventiveCare: [
    { month: "Jan", screenings: 612, routineCheckups: 548, followUpCompletion: 68 }, { month: "Feb", screenings: 648, routineCheckups: 576, followUpCompletion: 69 },
    { month: "Mar", screenings: 684, routineCheckups: 604, followUpCompletion: 71 }, { month: "Apr", screenings: 726, routineCheckups: 642, followUpCompletion: 70 },
    { month: "May", screenings: 768, routineCheckups: 684, followUpCompletion: 73 }, { month: "Jun", screenings: 812, routineCheckups: 726, followUpCompletion: 75 },
  ],
  summary: [
    { populationGroup: "0-17", patients: 1872, highRisk: 56, chronicConditions: 75, screeningRate: 78, healthcareUtilization: 57, status: "Healthy" },
    { populationGroup: "18-30", patients: 2746, highRisk: 110, chronicConditions: 192, screeningRate: 69, healthcareUtilization: 53, status: "Stable" },
    { populationGroup: "31-45", patients: 3494, highRisk: 210, chronicConditions: 489, screeningRate: 72, healthcareUtilization: 61, status: "Stable" },
    { populationGroup: "46-60", patients: 2619, highRisk: 236, chronicConditions: 785, screeningRate: 70, healthcareUtilization: 73, status: "Watch" },
    { populationGroup: "60+", patients: 1749, highRisk: 272, chronicConditions: 706, screeningRate: 76, healthcareUtilization: 81, status: "Attention" },
  ],
};

const scaleData = (data: PopulationHealthAnalyticsData, factor: number, comparison: string): PopulationHealthAnalyticsData => ({
  ...data,
  kpis: data.kpis.map((kpi) => ({ ...kpi, comparison })),
  populationGrowth: data.populationGrowth.map((point) => ({ ...point, totalPopulation: Math.round(point.totalPopulation * factor), newPatients: Math.round(point.newPatients * factor) })),
  ageDistribution: data.ageDistribution.map((point) => ({ ...point, count: Math.round(point.count * factor) })),
  genderDistribution: data.genderDistribution.map((point) => ({ ...point, count: Math.round(point.count * factor) })),
  commonConditions: data.commonConditions.map((point) => ({ ...point, affectedPatients: Math.round(point.affectedPatients * factor) })),
  healthRisk: data.healthRisk.map((point) => ({ ...point, count: Math.round(point.count * factor) })),
  utilizationByAge: data.utilizationByAge.map((point) => ({ ...point, appointments: Math.round(point.appointments * factor), consultations: Math.round(point.consultations * factor), labTests: Math.round(point.labTests * factor) })),
  regionalPatterns: data.regionalPatterns.map((point) => ({ ...point, registeredPatients: Math.round(point.registeredPatients * factor) })),
  preventiveCare: data.preventiveCare.map((point) => ({ ...point, screenings: Math.round(point.screenings * factor), routineCheckups: Math.round(point.routineCheckups * factor) })),
  summary: data.summary.map((point) => ({ ...point, patients: Math.round(point.patients * factor), highRisk: Math.round(point.highRisk * factor), chronicConditions: Math.round(point.chronicConditions * factor) })),
});

export const populationHealthMockData: PopulationHealthAnalyticsByPeriod = {
  today: baseData,
  week: scaleData(baseData, 0.42, "vs previous week"),
  month: baseData,
  year: scaleData(baseData, 8.7, "vs previous year"),
};
