"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ShieldCheck, User as UserIcon, LogOut, HeartPulse, Bell } from "lucide-react";
import HeaderLogo from "@/components/HeaderLogo";
import AuthFooter from "@/components/AuthFooter";
import { getStoredUser, clearAuthData, AuthUser, getRoleRedirectPath } from "@/lib/auth";
import Link from "next/link";

// Maps URL slug → expected role value
const SLUG_TO_ROLE: Record<string, string> = {
  "patient": "PATIENT",
  "admin": "ADMIN",
  "super-admin": "SUPER_ADMIN",
  "doctor": "DOCTOR",
  "pharmacist": "PHARMACIST",
  "insurance-officer": "INSURANCE_OFFICER",
  "lab-officer": "LAB_OFFICER",
};

export default function RoleDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      router.push("/login");
      return;
    }

    // Verify the user's role matches the URL they're trying to access
    const roleSlug = params.role as string;
    const expectedRole = SLUG_TO_ROLE[roleSlug];

    if (storedUser.role === "LAB_OFFICER" || !expectedRole || storedUser.role !== expectedRole) {
      // Redirect to the correct dashboard for their actual role
      router.push(getRoleRedirectPath(storedUser.role));
      return;
    }

    setUser(storedUser);
    setLoading(false);
  }, [router, params]);

  const handleLogout = () => {
    clearAuthData();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      {/* Dashboard Header */}
      <header className="bg-white border-b border-slate-100 py-4 px-6 sm:px-12 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <HeaderLogo />

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs text-blue-700 font-medium">
              <UserIcon className="w-3.5 h-3.5" />
              <span>{user?.fullName || "User"}</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                {user?.role || "PATIENT"}
              </span>
            </div>
            

<Link
  href="/support/admin"
  className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
>
  Support 
</Link>

<Link
  href="/notifications/admin"
  className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
>
  <Bell className="h-5 w-5" />
  
</Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-6 sm:p-10 flex flex-col justify-center">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 sm:p-12">
          {/* Welcome Status */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
                <HeartPulse className="w-8 h-8" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Authenticated Session
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  Welcome to Health Bridge, {user?.fullName}!
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Access Role
                </div>
                <div className="text-sm font-bold text-blue-700">
                  {user?.role}
                </div>
              </div>
              <ShieldCheck className="w-6 h-6 text-blue-600" />
            </div>
          </div>

          {/* Demonstration Notice */}
          <div className="mt-8 p-6 rounded-2xl bg-blue-50/60 border border-blue-100">
            <h3 className="font-bold text-blue-900 text-sm">
              ℹ️ Healthcare Dashboard Placeholder
            </h3>
            <p className="text-xs sm:text-sm text-blue-800/80 mt-2 leading-relaxed">
              You have successfully authenticated into the{" "}
              <strong>Health Bridge</strong> system. Your session is active and secure.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition">
              <div className="text-xs font-bold text-slate-700">
                Medical Records
              </div>
              <div className="text-xs text-slate-400 mt-1">
                EHR data synced securely
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition">
              <div className="text-xs font-bold text-slate-700">
                Appointments
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Schedule consultations
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition">
              <div className="text-xs font-bold text-slate-700">
                Prescriptions
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Verified digital pharmacy
              </div>
            </div>
          </div>
        </div>
      </main>

      <AuthFooter />
    </div>
  );
}
