"use client";

import React from "react";
import Link from "next/link";
import DashboardLayout from "@/app/dashboard/layout";
import {
  Users,
  Hospital,
  Calendar,
  FileText,
  DollarSign,
  Pill,
  Activity,
  Bell,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    { label: "Total Users", value: "1,284", icon: Users, color: "bg-blue-500" },
    { label: "Total Hospitals", value: "48", icon: Hospital, color: "bg-green-500" },
    { label: "Total Doctors", value: "342", icon: Activity, color: "bg-purple-500" },
    { label: "Total Patients", value: "8,921", icon: Users, color: "bg-pink-500" },
    { label: "Revenue", value: "$124,892", icon: DollarSign, color: "bg-yellow-500" },
    { label: "Appointments", value: "1,823", icon: Calendar, color: "bg-indigo-500" },
  ];

  const quickActions = [
    { label: "Manage Users", icon: Users, href: "/admin/users" },
    { label: "Manage Hospitals", icon: Hospital, href: "/admin/hospitals" },
    { label: "Billing", icon: FileText, href: "/hospital/billing" },
    { label: "Inventory", icon: Pill, href: "/hospital/inventory" },
    { label: "Compliance", icon: CheckCircle, href: "/hospital/billing/compliance" },
    { label: "Analytics", icon: TrendingUp, href: "/analytics" },
  ];

  const recentActivities = [
    { id: 1, user: "John Doe", action: "registered as a new patient", time: "2 mins ago", type: "success" },
    { id: 2, user: "Dr. Smith", action: "completed consultation for Patient #8842", time: "15 mins ago", type: "info" },
    { id: 3, user: "System", action: "Low stock alert for Paracetamol 500mg", time: "1 hour ago", type: "warning" },
    { id: 4, user: "Jane Doe", action: "paid invoice #INV-202609010001", time: "3 hours ago", type: "success" },
    { id: 5, user: "Dr. Kumar", action: "requested lab test for Patient #7721", time: "5 hours ago", type: "info" },
  ];

  return (
    <DashboardLayout pageTitle="Admin Dashboard">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, Admin! 👋</h1>
        <p className="mt-1 text-blue-100">Here&apos;s what&apos;s happening with your healthcare platform today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5 border border-slate-200 dark:border-slate-700 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-2.5 rounded-lg text-white`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition text-center group"
            >
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-100 dark:group-hover:bg-blue-800/40 transition">
                <action.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">{action.label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                {activity.type === "success" && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                {activity.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                {activity.type === "info" && <Activity className="w-5 h-5 text-blue-500" />}
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-800 dark:text-slate-200">
                  <span className="font-semibold">{activity.user}</span> {activity.action}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</p>
              </div>
              <span className="text-xs text-slate-400">#{String(activity.id).padStart(4, '0')}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}