export const APP_MESSAGES = {
  auth: {
    loginRequired: "Please log in to continue.",
    accessDenied: "You do not have access to this page.",
    invalidSession: "Your session has expired. Please log in again.",
    logoutSuccess: "You have been logged out successfully.",
  },
  validation: {
    required: "This field is required.",
    email: "Please enter a valid email address.",
    phone: "Please enter a valid phone number.",
    nic: "Please enter a valid NIC number.",
    password: "Password must be at least 8 characters long.",
  },
  dashboard: {
    welcome: "Welcome back",
  },
} as const;
