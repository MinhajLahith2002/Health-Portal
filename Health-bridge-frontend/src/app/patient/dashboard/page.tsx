"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User as UserIcon, LogOut, Bell, HeadphonesIcon, CreditCard, Video } from "lucide-react";
import { getStoredUser, clearAuthData, AuthUser, AUTH_CHANGE_EVENT } from "@/lib/auth";
import Link from "next/link";
import api from "@/lib/axios";
import { labReportService } from "@/services/labReportService";
import { insuranceService } from "@/services/insuranceService";

export default function PatientDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [labReports, setLabReports] = useState<any[]>([]);
  const [activePrescriptions, setActivePrescriptions] = useState<number>(0);
  const [insuranceMessagesCount, setInsuranceMessagesCount] = useState<number>(0);

  useEffect(() => {
    const storedUser = getStoredUser();

    // 1. Check if they are logged in at all
    if (!storedUser) {
      router.push("/login");
      return;
    }

    // 2. Check if their role is strictly 'PATIENT'
    if (storedUser.role !== "PATIENT") {
      router.replace("/login");
      return;
    }

    // 3. If they pass both checks, let them in!
    setUser(storedUser);

    const fetchData = () => {
      // Fetch Live Vitals
      api.get(`/health-metrics/patient/${storedUser.id}`)
          .then((data: any) => setMetrics(data))
          .catch(err => console.error(err));

      // Fetch Live Appointments
      api.get(`/appointments/my`)
          .then((data: any) => setAppointments(data))
          .catch(err => console.error(err));

      // Fetch Live Lab Reports
      labReportService.getPatientLabHistory(storedUser.id)
          .then(data => setLabReports(data))
          .catch(err => console.error(err));

      // Fetch Active Prescriptions Count
      api.get(`/prescriptions/patient/${storedUser.id}/active`)
          .then((data: any) => setActivePrescriptions(data.length))
          .catch(err => console.error(err))
          .finally(() => setLoading(false));

      // Fetch Live Insurance Messages
      insuranceService.getUnreadMessagesCount()
          .then(count => setInsuranceMessagesCount(count))
          .catch(() => setInsuranceMessagesCount(0));
    };

    // Initial fetch
    fetchData();

    // Set up live updating (polling every 5 seconds)
    const intervalId = setInterval(fetchData, 5000);

    // Watch for logout in another tab or component
    const handleAuthChange = () => {
      const current = getStoredUser();
      if (!current || current.role !== "PATIENT") {
        window.location.href = "/login";
      }
    };
    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);

    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    };
  }, [router]);

  const handleLogout = () => {
    clearAuthData();
    window.location.href = "/login";
  };

  // Dynamic Metric Calculations
  const upcomingAppointmentsCount = appointments.filter(a => a.status === 'UPCOMING' || a.status === 'BOOKED').length;
  const labReportsCount = labReports.length;

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getLatest = (type: string) => metrics.find(m => m.metricType === type);

  const getInitials = (name: string) => {
    if (!name) return "DR";
    const parts = name.replace("Dr. ", "").split(" ");
    return parts.map(p => p[0]).join("").substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
    );
  }

  return (
      <>
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {user?.fullName || "Patient"}! 👋
            </h1>
            <p className="mt-1 text-blue-100">Your health is our priority. Here&apos;s your health summary.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
                href="/telemedicine/history"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-sm transition"
            >
              <Video className="w-4 h-4" />
              <span>Telemedicine</span>
            </Link>
            <Link
                href="/payments"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-sm transition"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay Bills</span>
            </Link>
            <Link
                href="/notifications/patient"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-sm transition"
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </Link>
            <Link
                href="/support/patient/sdefault"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-blue-600 hover:bg-blue-50 text-xs font-semibold shadow-sm transition"
            >
              <HeadphonesIcon className="w-4 h-4" />
              <span>Support</span>
            </Link>
            <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-white text-xs font-semibold backdrop-blur-sm transition cursor-pointer"
                title="Log Out"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="flex flex-col gap-6">
          {/* Top Stat Cards Container */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Card 1: Appointments */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm flex items-center gap-4 group hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-blue-500/10 text-blue-500 rounded-lg border-[1.5px] border-blue-500/20">
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"></rect><line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"></line><line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"></line><line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"></line></svg>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-zinc-500 leading-tight">Upcoming<br/>appointments</span>
                <span className="text-2xl font-bold text-zinc-950 leading-none">{upcomingAppointmentsCount}</span>
              </div>
            </div>

            {/* Card 2: Prescriptions */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm flex items-center gap-4 group hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-teal-600/10 text-teal-700 rounded-lg border-[1.5px] border-teal-700/20">
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-125" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-zinc-500 leading-tight">Active<br/>prescriptions</span>
                <span className="text-2xl font-bold text-zinc-950 leading-none">{activePrescriptions}</span>
              </div>
            </div>

            {/* Card 3: Lab Reports */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm flex items-center gap-4 group hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-orange-500/15 text-orange-700 rounded-lg border-[1.5px] border-orange-700/20">
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-125" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-zinc-500 leading-tight">New lab<br/>reports</span>
                <span className="text-2xl font-bold text-zinc-950 leading-none">{labReportsCount}</span>
              </div>
            </div>

            {/* Card 4: Messages */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm flex items-center gap-4 group hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-red-600/10 text-red-600 rounded-lg border-[1.5px] border-red-600/20">
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-zinc-500 leading-tight">New messages<br/>from Insurance</span>
                <span className="text-2xl font-bold text-zinc-950 leading-none">{insuranceMessagesCount}</span>
              </div>
            </div>
          </div>

          {/* Middle Row Container */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Appointments List */}
            <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-zinc-950 text-[16px]">My Appointments</h3>
                <Link href="/appointments" className="text-sm font-medium text-blue-500 hover:text-blue-600 cursor-pointer">View all</Link>
              </div>

              <div className="flex flex-col">
                {appointments.length === 0 ? (
                    <div className="py-6 text-center text-sm text-zinc-500">No appointments found.</div>
                ) : (
                    appointments.slice(0, 2).map((app, index) => {
                      const isCancelled = app.status === 'CANCELLED' || app.status === 'NO_SHOW';
                      const isActive = app.status === 'UPCOMING' || app.status === 'BOOKED';
                      
                      let badgeText = app.status;
                      let badgeColor = "text-zinc-500";
                      if (app.status === 'COMPLETED') {
                        badgeColor = 'text-emerald-600';
                      } else if (app.status === 'CANCELLED' || app.status === 'NO_SHOW') {
                        badgeText = app.status.replace('_', ' ');
                        badgeColor = 'text-red-500';
                      } else if (app.status === 'UPCOMING' || app.status === 'BOOKED') {
                        badgeText = 'UPCOMING';
                        badgeColor = 'text-blue-600';
                      }

                      return (
                          <div key={index} className={`flex flex-col py-4 border-b border-zinc-100 last:border-0 ${isCancelled ? 'opacity-60' : ''}`}>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold ${isCancelled ? 'bg-slate-100 text-slate-400' : 'bg-blue-500/10 text-blue-500'}`}>
                                  {getInitials(app.doctorName)}
                                </div>
                                <div className="flex flex-col">
                                  <span className={`text-sm font-semibold ${isCancelled ? 'text-slate-500 line-through' : 'text-zinc-950'}`}>
                                    {app.doctorName || 'Unknown Doctor'}
                                  </span>
                                  <span className="text-xs text-zinc-500">
                                    {app.specialization} • {app.hospitalName}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <div className={`text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap ${isCancelled ? 'bg-red-500/10 text-red-600' : 'bg-blue-500/10 text-blue-500'}`}>
                                  {app.date}, {app.sessionTime}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider pr-1 ${badgeColor}`}>
                                  {badgeText}
                                </span>
                              </div>
                            </div>

                            {/* DYNAMIC LIVE QUEUE STATUS */}
                            {isActive && (
                              <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                  </span>
                                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Live Queue</span>
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex flex-col items-end">
                                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Now Serving</span>
                                    <span className="font-bold text-zinc-900">Token {app.currentQueueNumber || 0}</span> 
                                  </div>
                                  <div className="h-8 w-px bg-zinc-200"></div>
                                  <div className="flex flex-col items-end">
                                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Your Token</span>
                                    <span className="font-bold text-blue-600">Token {app.appointmentNumber || 0}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                      );
                    })
                )}
              </div>
            </div>

            {/* Vitals Box */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-zinc-950 text-[16px]">Vitals this week</h3>
                <Link href="/patient/health-metrics" className="text-sm font-medium text-blue-500 hover:text-blue-600 cursor-pointer">View all</Link>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                  <span className="text-sm text-zinc-500">Blood pressure</span>
                  <span className="text-sm font-bold text-zinc-950">
                    {getLatest("Blood Pressure") ? `${getLatest("Blood Pressure").value} mmHg` : '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                  <span className="text-sm text-zinc-500">Heart rate</span>
                  <span className="text-sm font-bold text-zinc-950">
                    {getLatest("Heart Rate") ? `${getLatest("Heart Rate").value} bpm` : '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                  <span className="text-sm text-zinc-500">Weight</span>
                  <span className="text-sm font-bold text-zinc-950">
                    {getLatest("Weight") ? `${getLatest("Weight").value} kg` : '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-zinc-500">Blood sugar</span>
                  <span className="text-sm font-bold text-zinc-950">
                    {getLatest("Blood Sugar") ? `${getLatest("Blood Sugar").value} mg/dL` : '--'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row Container */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-zinc-950 text-[16px]">Recent lab reports</h3>
              <Link href="/patient/lab-reports" className="text-sm font-medium text-blue-500 hover:text-blue-600 cursor-pointer">View all</Link>
            </div>

            <div className="w-full">
              <div className="flex justify-between items-center text-xs text-zinc-500 pb-3 border-b border-zinc-200">
                <div className="w-1/3">Test Parameter</div>
                <div className="w-1/3 text-center">Date</div>
                <div className="w-1/3 flex justify-end pr-2">Status</div>
              </div>

              <div className="flex flex-col">
                {labReports.length === 0 ? (
                    <div className="py-8 text-center text-sm text-zinc-500">No lab reports available.</div>
                ) : (
                    labReports.slice(0, 3).map((report, index) => (
                        <div key={index} className="flex justify-between items-center py-4 border-b border-zinc-100 last:border-0 hover:bg-slate-50 transition px-2 -mx-2 rounded-lg">
                          <div className="w-1/3 text-sm text-zinc-950 font-medium truncate pr-2">
                            {report.parameters && report.parameters.length > 0 ? (
                              <>
                                {report.parameters[0].parameterName}
                                {report.parameters.length > 1 && (
                                  <span className="text-zinc-500 text-xs ml-1.5 font-normal">
                                    +{report.parameters.length - 1} more
                                  </span>
                                )}
                              </>
                            ) : (
                              `Test Order #${report.testOrderId}`
                            )}
                          </div>
                          <div className="w-1/3 text-sm text-zinc-500 text-center">
                            {formatDate(report.publishedAt || report.resultedAt)}
                          </div>
                          <div className="w-1/3 flex justify-end items-center gap-4 sm:gap-8 pr-2">
                            { (report.critical || report.isCritical) ? (
                                <span className="bg-red-500/15 text-red-700 text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">Critical</span>
                            ) : (report.abnormal || report.isAbnormal) ? (
                                <span className="bg-orange-500/15 text-orange-700 text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">Review needed</span>
                            ) : (
                                <span className="bg-teal-500/15 text-teal-700 text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">Normal</span>
                            )}
                          </div>
                        </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      </>
  );
}