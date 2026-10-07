import { ROUTES } from "@/constants/routes";

export interface AuthUser {
  id: string;
  fullName?: string;
  email?: string;
  role:
      | "PATIENT"
      | "ADMIN"
      | "SUPER_ADMIN"
      | "DOCTOR"
      | "PHARMACIST"
      | "INSURANCE_OFFICER"
      | "LAB_OFFICER";
}

const TOKEN_KEY = "healthbridge_token";
const USER_KEY = "healthbridge_user";
const TOKEN_COOKIE = "healthbridge_token";
const USER_COOKIE = "healthbridge_user";

const setCookie = (name: string, value: string, maxAgeInSeconds = 60 * 60 * 24 * 7) => {
  if (typeof document === "undefined") return;

  const isHttps = window.location.protocol === "https:";
  const securePart = isHttps ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeInSeconds}; SameSite=Lax${securePart}`;
};

const clearCookie = (name: string) => {
  if (typeof document === "undefined") return;

  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
  const securePart = isHttps ? "; Secure" : "";
  document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${securePart}`;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

  if (typeof window !== "undefined" && window.location.hostname) {
    const host = window.location.hostname;
    document.cookie = `${name}=; path=/; domain=${host}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${securePart}`;
    document.cookie = `${name}=; path=/; domain=.${host}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${securePart}`;
  }
};

/** Custom event name fired whenever auth data is saved or cleared. */
export const AUTH_CHANGE_EVENT = "healthbridge_auth_change";

/** Notify all listeners (useAuth external store) that auth data changed. */
const notifyAuthChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
};

/** Persists the token and user after a successful login/register/OAuth call. */
export const saveAuthData = (token: string, user: AuthUser) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setCookie(TOKEN_COOKIE, token);
    setCookie(USER_COOKIE, JSON.stringify(user));
    notifyAuthChange();
  }
};

export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    const localToken = localStorage.getItem(TOKEN_KEY);
    if (localToken) return localToken;

    const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_COOKIE}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  }
  return null;
};

export const getStoredUser = (): AuthUser | null => {
  if (typeof window !== "undefined") {
    const localData = localStorage.getItem(USER_KEY);
    if (localData) {
      try {
        return JSON.parse(localData);
      } catch {
        return null;
      }
    }

    const cookieMatch = document.cookie.match(new RegExp(`(?:^|; )${USER_COOKIE}=([^;]*)`));
    if (!cookieMatch) return null;

    try {
      return JSON.parse(decodeURIComponent(cookieMatch[1]));
    } catch {
      return null;
    }
  }
  return null;
};

export const clearAuthData = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    clearCookie(TOKEN_COOKIE);
    clearCookie(USER_COOKIE);
    clearCookie("token");
    clearCookie("authToken");
    notifyAuthChange();
  }
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/** Where to send a user right after auth, based on their role. */
export const getRoleRedirectPath = (role: string): string => {
  switch (role) {
    case "SUPER_ADMIN":
      return ROUTES.dashboard.superAdmin;
    case "ADMIN":
      return ROUTES.dashboard.admin;
    case "DOCTOR":
      return ROUTES.dashboard.doctor;
    case "PHARMACIST":
      return "/pharmacy/dashboard";
      // return ROUTES.dashboard.pharmacist;
    case "INSURANCE_OFFICER":
      return ROUTES.dashboard.insuranceOfficer;
    case "LAB_OFFICER":
      return ROUTES.dashboard.labOfficer;
    case "PATIENT":
    default:
      return ROUTES.dashboard.patient;
  }
};