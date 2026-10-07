export const ROUTES = {
  home: "/",
  welcome: "/welcome",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  otp: "/otp",
  resetPassword: "/reset-password",
  loadingDemo: "/loading-demo",
  logout: "/logout",
  dashboard: {
    patient: "/patient/dashboard",
    doctor: "/doctor/dashboard",
    admin: "/admin/dashboard",
    superAdmin: "/super-admin/dashboard",
    pharmacist: "/pharmacist/dashboard",
    insuranceOfficer: "/insurance-officer/dashboard",
    labOfficer: "/laboratory/dashboard",
  },
  appointments: {
    searchDoctor: "/appointments/search-doctor",
    book: "/appointments/book",
    list: "/appointments",
    details: (id: string) => `/appointments/${id}`,
  },
  profile: {
    patient: "/patient/profile",
  },
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.home,
  ROUTES.welcome,
  ROUTES.login,
  ROUTES.register,
  ROUTES.forgotPassword,
  ROUTES.otp,
  ROUTES.resetPassword,
  ROUTES.loadingDemo,
  ROUTES.logout,
  ROUTES.appointments.searchDoctor,
];

export const ROLE_ROUTE_MAP: Record<string, string> = {
  PATIENT: ROUTES.dashboard.patient,
  ADMIN: ROUTES.dashboard.admin,
  SUPER_ADMIN: ROUTES.dashboard.superAdmin,
  DOCTOR: ROUTES.dashboard.doctor,
  PHARMACIST: ROUTES.dashboard.pharmacist,
  INSURANCE_OFFICER: ROUTES.dashboard.insuranceOfficer,
  LAB_OFFICER: ROUTES.dashboard.labOfficer,
};
