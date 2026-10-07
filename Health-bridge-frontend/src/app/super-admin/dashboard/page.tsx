"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Building2, 
  Stethoscope, 
  Banknote, 
  Activity, 
  ShieldCheck, 
  AlertTriangle,
  Plus,
  FileText,
  Settings,
  Building,
  User,
  Clock,
  HardDrive,
  CheckCircle2
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import Link from "next/link";
import { superAdminService, SuperAdminStatsDto, SuperAdminGrowthDto } from "@/services/superadmin.service";

export default function AdminDashboardPage() {
  const [userName, setUserName] = useState("Kasuni");
  const [stats, setStats] = useState<SuperAdminStatsDto | null>(null);
  const [chartData, setChartData] = useState<SuperAdminGrowthDto[]>([]);
  const [pendingCardScreen, setPendingCardScreen] = useState<0 | 1>(0);
  const [formattedDate, setFormattedDate] = useState("Loading...");
  const [formattedTime, setFormattedTime] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("healthbridge_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.fullName || "Kasuni");
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }

    const fetchStats = async () => {
      try {
        const data = await superAdminService.getDashboardStats();
        setStats(data);
        
        const growth = await superAdminService.getGrowthData();
        setChartData(growth);
      } catch (error) {
        console.error("Failed to fetch super admin dashboard stats:", error);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setFormattedDate(now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }));
      setFormattedTime(now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }));
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div className="flex flex-col gap-6 w-full p-4 sm:p-6 lg:p-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome back, {userName}</h1>
            <p className="text-slate-500 mt-2 text-sm max-w-2xl">
              Here is your overview of the with users, hospitals, doctors, revenue, active sessions, system health, and security alerts.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">TODAY'S DATE</p>
            <p className="text-lg font-bold text-slate-800">{formattedDate}</p>
            {formattedTime && <p className="text-sm font-medium text-slate-500">{formattedTime}</p>}
          </div>
        </div>

        {/* Primary Metrics (4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <Link href="/super-admin/users" className="block transition-transform hover:-translate-y-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-40 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
                <div className="px-2.5 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full flex items-center gap-1">
                  ↑ 12%
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Users</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats ? stats.totalUsers.toLocaleString() : "..."}</h3>
              </div>
            </div>
          </Link>

          {/* Card 2 */}
          <Link href="/super-admin/hospitals" className="block transition-transform hover:-translate-y-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-40 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-cyan-100 text-cyan-600 rounded-xl">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="px-2.5 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full flex items-center gap-1">
                  ↑ 5%
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Registered Hospitals</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats ? stats.totalHospitals.toLocaleString() : "..."}</h3>
              </div>
            </div>
          </Link>

          {/* Card 3 */}
          <Link href="/super-admin/doctors" className="block transition-transform hover:-translate-y-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-40 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div className="px-2.5 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full flex items-center gap-1">
                  ↑ 8%
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Registered Doctors</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats ? stats.activeDoctors.toLocaleString() : "..."}</h3>
              </div>
            </div>
          </Link>

          {/* Card 4 */}
          <Link href="/super-admin/analytics" className="block transition-transform hover:-translate-y-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-40 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                  <Banknote className="w-6 h-6" />
                </div>
                <div className="px-2.5 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full flex items-center gap-1">
                  ↑ 18%
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Monthly Recurring Revenue</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">Rs. {stats?.monthlyRecurringRevenue != null ? stats.monthlyRecurringRevenue.toLocaleString() : "..."}</h3>
              </div>
            </div>
          </Link>
        </div>

        {/* Secondary Metrics (5 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          
          {/* Card 5 - Pending Verifications */}
          <Link href="/super-admin/users?tab=pending" className="block transition-transform hover:-translate-y-1">
            <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm flex flex-col justify-between h-40 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="px-3 py-1.5 bg-amber-50 text-amber-600 text-xs font-bold rounded-full">
                  Action required
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Pending Approvals</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.pendingVerifications != null ? stats.pendingVerifications : "..."}</h3>
              </div>
            </div>
          </Link>

          {/* Card 6 - Active Sessions */}
          <Link href="/super-admin/analytics" className="block transition-transform hover:-translate-y-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-40 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="p-3 text-emerald-500 rounded-xl">
                  <Activity className="w-8 h-8" />
                </div>
                <div className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Live
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Active Sessions</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.activeSessions != null ? stats.activeSessions.toLocaleString() : "..."}</h3>
              </div>
            </div>
          </Link>

          {/* Card 7 - System Health */}
          <Link href="/super-admin/settings" className="block transition-transform hover:-translate-y-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-40 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="p-3 text-emerald-500 rounded-xl">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full">
                  Healthy
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">System Health</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.systemHealthPercentage != null ? stats.systemHealthPercentage : "..."}%</h3>
              </div>
            </div>
          </Link>

          {/* Card 8 - Storage Used */}
          <Link href="/super-admin/settings" className="block transition-transform hover:-translate-y-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-40 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                  Optimal
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Storage Used</p>
                <div className="flex items-end gap-2 mt-1">
                  <h3 className="text-2xl font-bold text-slate-900">{stats?.storageUsedPercentage != null ? stats.storageUsedPercentage : "..."}%</h3>
                  <span className="text-xs text-slate-400 mb-1">of 5TB</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Card 9 - Security Alerts */}
          <Link href="/super-admin/audit-logs" className="block transition-transform hover:-translate-y-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-40 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="p-3 text-red-500 rounded-xl">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-full flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Needs attention
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Security Alerts</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.securityAlerts != null ? stats.securityAlerts : "..."}</h3>
              </div>
            </div>
          </Link>
        </div>

        {/* Bottom Section (3 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-96">
          
          {/* User Activity Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-slate-900">User Activity</h3>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">Last 7 days</span>
            </div>
            <div className="flex-1 w-full min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 12 }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                    tickFormatter={(value) => `${value / 1000}k`} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#2563EB" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pending Approvals List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-slate-900">Pending Approvals</h3>
              <Link href="/super-admin/users?tab=pending" className="text-xs font-bold text-blue-600 hover:text-blue-700">View all</Link>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
              
              {stats?.topPendingApprovals && stats.topPendingApprovals.length > 0 ? (
                stats.topPendingApprovals.map((user) => (
                  <div key={user.id} className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-xl p-3 hover:border-amber-200 hover:bg-amber-50/30 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                      {user.role === 'DOCTOR' ? <User className="w-5 h-5" /> : <Building className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs font-medium text-slate-500 truncate">{user.role} • {user.timeAgo}</p>
                    </div>
                    <Link href={`/super-admin/users?tab=pending&id=${user.id}`} className="shrink-0 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                      Review
                    </Link>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-sm text-slate-400 h-full">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-6 h-6 text-slate-300" />
                  </div>
                  No pending approvals!
                </div>
              )}

            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
            <div className="mb-6">
              <h3 className="text-base font-bold text-slate-900">Quick Actions</h3>
            </div>
            <div className="flex-1 flex flex-col gap-3">
              
              <Link href="/super-admin/hospitals/add" className="flex items-center gap-3 px-5 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-semibold shadow-sm">
                <Plus className="w-5 h-5" />
                Add Hospital
              </Link>

              <Link href="/super-admin/doctors/add" className="flex items-center gap-3 px-5 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-semibold shadow-sm">
                <User className="w-5 h-5" />
                Add Doctor
              </Link>

              <button onClick={() => superAdminService.downloadDashboardReport()} className="flex items-center gap-3 px-5 py-4 bg-white hover:bg-slate-50 text-blue-600 border border-slate-200 rounded-xl transition-colors font-semibold shadow-sm text-left">
                <FileText className="w-5 h-5" />
                Generate Report
              </button>

              <Link href="/super-admin/settings" className="flex items-center gap-3 px-5 py-4 bg-white hover:bg-slate-50 text-blue-600 border border-slate-200 rounded-xl transition-colors font-semibold shadow-sm">
                <Settings className="w-5 h-5" />
                System Settings
              </Link>

            </div>
          </div>

        </div>

      </div>
    </>
  );
}
