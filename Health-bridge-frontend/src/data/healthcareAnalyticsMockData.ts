import type { HealthcareAnalyticsByPeriod, HealthcareAnalyticsData } from "@/types/healthcareAnalytics";

const baseHealthcareData: HealthcareAnalyticsData = {
  kpis: [
    { label: "Total Patients", value: "1,248", change: "+12.5%", direction: "up", comparison: "vs previous month", icon: "P", accent: "blue" },
    { label: "New Patients", value: "146", change: "+8.4%", direction: "up", comparison: "vs previous month", icon: "P", accent: "violet" },
    { label: "Completed Consultations", value: "318", change: "+6.4%", direction: "up", comparison: "vs previous month", icon: "C", accent: "teal" },
    { label: "Appointment Completion Rate", value: "87.6%", change: "+3.1%", direction: "up", comparison: "vs previous month", icon: "A", accent: "green" },
    { label: "Laboratory Tests", value: "892", change: "-3.1%", direction: "down", comparison: "vs previous month", icon: "L", accent: "rose" },
    { label: "Prescriptions Issued", value: "674", change: "+7.8%", direction: "up", comparison: "vs previous month", icon: "I", accent: "amber" },
  ],
  patientGrowth: [
    { month: "Jan", totalPatients: 840, newPatients: 88 }, { month: "Feb", totalPatients: 910, newPatients: 96 },
    { month: "Mar", totalPatients: 980, newPatients: 108 }, { month: "Apr", totalPatients: 1050, newPatients: 116 },
    { month: "May", totalPatients: 1150, newPatients: 132 }, { month: "Jun", totalPatients: 1248, newPatients: 146 },
  ],
  appointments: [
    { month: "Jan", booked: 352, completed: 296, cancelled: 28, noShow: 28, consultations: 272 },
    { month: "Feb", booked: 374, completed: 314, cancelled: 31, noShow: 29, consultations: 288 },
    { month: "Mar", booked: 398, completed: 336, cancelled: 30, noShow: 32, consultations: 302 },
    { month: "Apr", booked: 416, completed: 354, cancelled: 29, noShow: 33, consultations: 310 },
    { month: "May", booked: 438, completed: 376, cancelled: 30, noShow: 32, consultations: 326 },
    { month: "Jun", booked: 462, completed: 404, cancelled: 27, noShow: 31, consultations: 342 },
  ],
  clinicalActivity: [
    { month: "Jan", labTests: 720, prescriptions: 520, telemedicineSessions: 126 },
    { month: "Feb", labTests: 756, prescriptions: 548, telemedicineSessions: 138 },
    { month: "Mar", labTests: 782, prescriptions: 576, telemedicineSessions: 151 },
    { month: "Apr", labTests: 814, prescriptions: 604, telemedicineSessions: 164 },
    { month: "May", labTests: 856, prescriptions: 638, telemedicineSessions: 178 },
    { month: "Jun", labTests: 892, prescriptions: 674, telemedicineSessions: 194 },
  ],
  ageGroups: [
    { label: "0-17", value: 14 }, { label: "18-30", value: 22 }, { label: "31-45", value: 27 },
    { label: "46-60", value: 21 }, { label: "60+", value: 16 },
  ],
  genderDistribution: [
    { label: "Male", value: 47 }, { label: "Female", value: 49 }, { label: "Other", value: 4 },
  ],
  departments: [
    { department: "Emergency", patients: 284, consultations: 96, completionRate: 83, status: "Attention" },
    { department: "Cardiology", patients: 196, consultations: 72, completionRate: 91, status: "Healthy" },
    { department: "General Medicine", patients: 342, consultations: 128, completionRate: 88, status: "Healthy" },
    { department: "Pediatrics", patients: 218, consultations: 84, completionRate: 86, status: "Watch" },
    { department: "Laboratory", patients: 208, consultations: 46, completionRate: 94, status: "Healthy" },
  ],
  performance: [
    { department: "Emergency", patients: 284, appointments: 116, consultations: 96, completionRate: 83, status: "Attention" },
    { department: "Cardiology", patients: 196, appointments: 79, consultations: 72, completionRate: 91, status: "Healthy" },
    { department: "General Medicine", patients: 342, appointments: 145, consultations: 128, completionRate: 88, status: "Healthy" },
    { department: "Pediatrics", patients: 218, appointments: 98, consultations: 84, completionRate: 86, status: "Watch" },
    { department: "Laboratory", patients: 208, appointments: 49, consultations: 46, completionRate: 94, status: "Healthy" },
  ],
};

export const healthcareAnalyticsMockData: HealthcareAnalyticsByPeriod = {
  today: baseHealthcareData,
  week: baseHealthcareData,
  month: baseHealthcareData,
  year: {
    ...baseHealthcareData,
    kpis: baseHealthcareData.kpis.map((kpi) => ({ ...kpi, comparison: "vs previous year" })),
    patientGrowth: baseHealthcareData.patientGrowth.map((point) => ({ ...point, totalPatients: point.totalPatients * 8, newPatients: point.newPatients * 8 })),
    appointments: baseHealthcareData.appointments.map((point) => ({ ...point, booked: point.booked * 8, completed: point.completed * 8, cancelled: point.cancelled * 8, noShow: point.noShow * 8, consultations: point.consultations * 8 })),
    clinicalActivity: baseHealthcareData.clinicalActivity.map((point) => ({ ...point, labTests: point.labTests * 8, prescriptions: point.prescriptions * 8, telemedicineSessions: point.telemedicineSessions * 8 })),
  },
};