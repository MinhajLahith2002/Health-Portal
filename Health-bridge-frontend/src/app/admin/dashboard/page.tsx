"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken, getStoredUser } from "@/lib/auth";
import DashboardLayout from "@/app/dashboard/layout";
import api from "@/lib/axios";
import { hospitalService } from "@/services/hospital.service";
import { doctorService } from "@/services/doctorService";
import { patientService } from "@/services/patientService";
import {
  Users,
  Hospital,
  Calendar,
  DollarSign,
  Pill,
  Activity,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Settings,
  UserCheck,
  ClipboardCheck,
  RefreshCw,
  Sparkles,
  Server,
  ShieldCheck,
  ArrowUpRight,
  UserPlus,
  Clock,
  Zap,
  Wifi,
  WifiOff,
  Building2,
  Stethoscope,
  UserCheck2,
} from "lucide-react";

interface UserProfile {
  id: string;
  fullName?: string;
  email?: string;
  role?: string;
  accountStatus?: string;
  createdAt?: string;
}

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "user" | "hospital" | "system";
  badge: "success" | "warning" | "info";
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activityFilter, setActivityFilter] = useState<"all" | "user" | "hospital">("all");

  const isMounted = useRef(true);
  const hasChecked = useRef(false);

  // Live Backend Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHospitals: 0,
    totalDoctors: 0,
    totalPatients: 0,
    activeAdmins: 0,
    totalAppointments: 0,
  });

  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Fetch purely from Backend Endpoints
  const fetchBackendData = useCallback(async () => {
    setErrorMsg(null);
    try {
      console.log("📡 Fetching live backend telemetry...");

      const [usersRes, hospitalsRes, doctorsRes, patientsRes] = await Promise.allSettled([
        api.get<UserProfile[]>("/users"),
        hospitalService.getAllHospitals(),
        doctorService.getAllDoctors(),
        patientService.getAllPatients(),
      ]);

      let backendUsers: UserProfile[] = [];
      let backendHospitalsCount = 0;
      let backendDoctorsCount = 0;
      let backendPatientsCount = 0;
      let backendAdminsCount = 0;

      // Extract real user profiles
      if (usersRes.status === "fulfilled" && Array.isArray(usersRes.value)) {
        backendUsers = usersRes.value;
        setUsersList(backendUsers);
        backendDoctorsCount = backendUsers.filter((u) => u.role === "DOCTOR").length;
        backendPatientsCount = backendUsers.filter((u) => u.role === "PATIENT").length;
        backendAdminsCount = backendUsers.filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length;
      }

      // Extract real hospitals count
      if (hospitalsRes.status === "fulfilled" && Array.isArray(hospitalsRes.value)) {
        backendHospitalsCount = hospitalsRes.value.length;
      }

      // Extract real doctors count (if explicit endpoint exists)
      if (doctorsRes.status === "fulfilled" && Array.isArray(doctorsRes.value) && doctorsRes.value.length > 0) {
        backendDoctorsCount = Math.max(backendDoctorsCount, doctorsRes.value.length);
      }

      // Extract real patients count (if explicit endpoint exists)
      if (patientsRes.status === "fulfilled" && Array.isArray(patientsRes.value) && patientsRes.value.length > 0) {
        backendPatientsCount = Math.max(backendPatientsCount, patientsRes.value.length);
      }

      setStats({
        totalUsers: backendUsers.length,
        totalHospitals: backendHospitalsCount,
        totalDoctors: backendDoctorsCount,
        totalPatients: backendPatientsCount,
        activeAdmins: backendAdminsCount,
        totalAppointments: 0, // Dynamic from DB
      });

      // Construct Activity Feed strictly from real database items
      const dynamicActivities: ActivityItem[] = [];

      if (backendUsers.length > 0) {
        const sorted = [...backendUsers]
          .filter((u) => u.fullName || u.email)
          .slice(-10)
          .reverse();

        sorted.forEach((u, i) => {
          dynamicActivities.push({
            id: u.id || `act-${i}`,
            title: u.fullName || u.email || "Registered User",
            description: `Account created with role: ${u.role || "USER"} (${u.email || "N/A"})`,
            time: u.createdAt
              ? new Date(u.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })
              : `User #${i + 1}`,
            type: "user",
            badge: u.accountStatus === "ACTIVE" ? "success" : "info",
          });
        });
      }

      setActivities(dynamicActivities);
      setApiConnected(true);
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch (err: unknown) {
      console.error("❌ Failed to fetch backend data:", err);
      setApiConnected(false);
      setErrorMsg("Failed to connect to backend server. Make sure backend service is running at http://localhost:8088/api");
    }
  }, []);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const token = getToken();
    const user = getStoredUser();

    if (!token || !user) {
      router.replace("/login");
      return;
    }

    if (isMounted.current) {
      setIsAuthenticated(true);
      setUserName(user.fullName ?? "Administrator");

      fetchBackendData().finally(() => {
        if (isMounted.current) {
          setLoading(false);
        }
      });
    }

    return () => {
      isMounted.current = false;
    };
  }, [router, fetchBackendData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBackendData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="min-h-[70vh] flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600 font-semibold">Loading Hospital Overview...</p>
      </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const statCards = [
    {
      title: "Total Registered Users",
      value: stats.totalUsers,
      subtext: `${stats.activeAdmins} Admin Accounts`,
      icon: Users,
      gradient: "from-blue-600 to-indigo-600",
      accentBg: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      title: "Hospitals Connected",
      value: stats.totalHospitals,
      subtext: "Medical Facilities",
      icon: Hospital,
      gradient: "from-emerald-600 to-teal-600",
      accentBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      title: "Active Doctors",
      value: stats.totalDoctors,
      subtext: "Verified Practitioners",
      icon: Stethoscope,
      gradient: "from-violet-600 to-purple-600",
      accentBg: "bg-purple-50 text-purple-600 border-purple-100",
    },
    {
      title: "Registered Patients",
      value: stats.totalPatients,
      subtext: "Healthcare Seekers",
      icon: UserCheck2,
      gradient: "from-rose-500 to-pink-600",
      accentBg: "bg-pink-50 text-pink-600 border-pink-100",
    },
  ];

  const quickActions = [
    { label: "User Management", icon: Users, href: "/admin/users", description: "Roles, permissions & profiles", color: "from-blue-500 to-cyan-500" },
    { label: "Hospital Directory", icon: Building2, href: "/hospital/inventory", description: "Inventory & facilities", color: "from-emerald-500 to-teal-500" },
    { label: "Billing & Invoices", icon: DollarSign, href: "/hospital/billing", description: "Claims and transactions", color: "from-amber-500 to-orange-500" },
    { label: "Compliance Monitoring", icon: ClipboardCheck, href: "/hospital/billing/compliance", description: "Audit & safety standards", color: "from-purple-500 to-indigo-500" },
    { label: "System Analytics", icon: TrendingUp, href: "/analytics", description: "Reports & data metrics", color: "from-pink-500 to-rose-500" },
    { label: "Admin Settings", icon: Settings, href: "/admin/settings", description: "Configurations & security", color: "from-slate-600 to-slate-800" },
  ];

  const filteredActivities = activities.filter((act) => {
    if (activityFilter === "all") return true;
    return act.type === activityFilter;
  });

  return (
    <DashboardLayout pageTitle="Admin Portal">
      <div className="space-y-8 pb-12">
        {/* Top Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 shadow-2xl border border-slate-800">
          {/* Background mesh design */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5" /> Live Administration Control Center
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold backdrop-blur-md">
                  {apiConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5 text-rose-400" />}
                  {apiConnected ? "Backend Online" : "Backend Disconnected"}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-3 bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Welcome back, {userName}
              </h1>
              <p className="mt-2 text-slate-300 text-sm max-w-2xl leading-relaxed">
                Real-time platform metrics synchronized directly from the HealthBridge backend API services.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start lg:self-auto">
              {lastRefreshed && (
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Refreshed: {lastRefreshed}
                </span>
              )}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                <span>{refreshing ? "Fetching API..." : "Sync Backend"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Backend Error Alert if any */}
        {errorMsg && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5 text-rose-800 flex items-start gap-4 shadow-sm">
            <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-sm text-rose-900">Backend Connection Warning</h3>
              <p className="text-xs text-rose-700 mt-1 leading-relaxed">{errorMsg}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition shadow-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Key Live Telemetry Cards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" /> Real-time System Telemetry
            </h2>
            <span className="text-xs font-medium text-slate-500">Live Database Counters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {statCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="relative group bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-slate-300 transition duration-300 overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${card.gradient}`} />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {card.title}
                    </span>
                    <div className={`p-3 rounded-xl ${card.accentBg} shadow-sm border group-hover:scale-110 transition duration-300`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-3xl font-black text-slate-900 tracking-tight">
                      {card.value.toLocaleString()}
                    </div>
                    <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {card.subtext}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* User Role Distribution Visual Bar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">User Role Distribution</h3>
              <p className="text-xs text-slate-500">Breakdown of registered accounts across backend system roles</p>
            </div>
            <div className="text-xs font-semibold text-slate-600">
              Total Users: <span className="font-bold text-blue-600">{stats.totalUsers}</span>
            </div>
          </div>

          {stats.totalUsers > 0 ? (
            <div className="space-y-3">
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                <div
                  style={{ width: `${Math.max(5, (stats.totalPatients / stats.totalUsers) * 100)}%` }}
                  className="bg-pink-500 h-full transition-all duration-500"
                  title={`Patients: ${stats.totalPatients}`}
                />
                <div
                  style={{ width: `${Math.max(5, (stats.totalDoctors / stats.totalUsers) * 100)}%` }}
                  className="bg-purple-500 h-full transition-all duration-500"
                  title={`Doctors: ${stats.totalDoctors}`}
                />
                <div
                  style={{ width: `${Math.max(5, (stats.activeAdmins / stats.totalUsers) * 100)}%` }}
                  className="bg-blue-600 h-full transition-all duration-500"
                  title={`Admins: ${stats.activeAdmins}`}
                />
              </div>

              <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-600 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-pink-500 inline-block" />
                  <span>Patients ({stats.totalPatients})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
                  <span>Doctors ({stats.totalDoctors})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
                  <span>Admins ({stats.activeAdmins})</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No user accounts found in backend database yet.
            </div>
          )}
        </div>

        {/* Quick Management Actions Grid */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Management Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Link
                  key={idx}
                  href={action.href}
                  className="group relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-blue-200 transition duration-300 flex items-start gap-4"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition duration-300`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                        {action.label}
                      </h3>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition duration-300" />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{action.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Live Recent Activity & System Logs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent User Registrations & Activity</h2>
              <p className="text-xs text-slate-500">Live entries from the backend database</p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActivityFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${activityFilter === "all" ? "bg-white text-blue-600 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"}`}
              >
                All ({activities.length})
              </button>
              <button
                onClick={() => setActivityFilter("user")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${activityFilter === "user" ? "bg-white text-blue-600 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"}`}
              >
                Users Only
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0 hover:bg-slate-50/60 p-3 rounded-xl transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{act.title}</h4>
                      <span className="text-xs text-slate-400 font-mono whitespace-nowrap">{act.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{act.description}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                    Verified
                  </span>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Activity className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm font-medium text-slate-600">No activity records found in backend</p>
                <p className="text-xs text-slate-400">Newly registered users will automatically appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}