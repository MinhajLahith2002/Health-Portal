"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import {
  ChevronLeft,
  Edit,
  Key,
  Ban,
} from "lucide-react";

export default function UserDetailsPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("Overview");
  
  // Since we are mocking, we will just use static data for Dr. Kavindu Perera
  const tabs = ["Overview", "Activity log", "Permissions", "Documents"];

  const loginHistory = [
    { time: "Today, 9:41 AM", device: "Chrome · Windows", ip: "175.157.42.11", location: "Colombo, LK", status: "Success" },
    { time: "Yesterday, 6:02 PM", device: "Health Bridge App · iOS", ip: "175.157.42.11", location: "Colombo, LK", status: "Success" },
    { time: "10 Aug 2026, 8:15 AM", device: "Chrome · Windows", ip: "175.157.42.11", location: "Colombo, LK", status: "Success" },
    { time: "08 Aug 2026, 11:52 PM", device: "Unknown device", ip: "203.94.11.87", location: "Unknown", status: "Failed - blocked" },
    { time: "07 Aug 2026, 7:30 AM", device: "Health Bridge App · iOS", ip: "175.157.42.11", location: "Colombo, LK", status: "Success" },
  ];

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Back Link */}
        <Link 
          href="/super-admin/users" 
          className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to User Management
        </Link>

        {/* Profile Header Card */}
        <Card className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            
            {/* Left side: Avatar and Details */}
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 shrink-0 rounded-full bg-[#0052CC] text-white font-bold text-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                KP
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-[#0A2540] dark:text-white">
                    Dr. Kavindu Perera
                  </h1>
                  <Badge variant="primary" className="bg-blue-50 text-blue-700 border-blue-200">Doctor</Badge>
                  <Badge variant="success" dot className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <p>kavindu.perera@healthbridge.lk</p>
                  <p>+94 77 214 5590</p>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 font-medium">
                  <p>ID: HB-DR-00231</p>
                  <p>Colombo General Hospital</p>
                  <p>Registered 12 Mar 2026</p>
                </div>
              </div>
            </div>

            {/* Right side: Action Buttons */}
            <div className="flex flex-wrap lg:flex-nowrap items-start gap-3 shrink-0">
              <Button variant="outline" leftIcon={<Edit size={16} />}>
                Edit profile
              </Button>
              <Button variant="outline" leftIcon={<Key size={16} />}>
                Reset password
              </Button>
              <Button 
                variant="outline" 
                leftIcon={<Ban size={16} />} 
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:border-red-900/50 dark:hover:bg-red-950/30 dark:text-red-400"
              >
                Suspend account
              </Button>
            </div>
            
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-slate-200 dark:border-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-semibold transition-colors relative ${
                activeTab === tab
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content Section (Overview Tab) */}
        {activeTab === "Overview" && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Personal Info */}
              <Card className="p-6 lg:col-span-2">
                <h3 className="text-lg font-bold text-[#0A2540] dark:text-white mb-1">
                  Personal & account information
                </h3>
                <p className="text-sm text-slate-500 mb-6">Basic details on file for this user</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Name</p>
                    <p className="text-sm font-medium text-[#0A2540] dark:text-white">Dr. Kavindu Perera</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Date of Birth</p>
                    <p className="text-sm font-medium text-[#0A2540] dark:text-white">14 Jun 1988</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">NIC Number</p>
                    <p className="text-sm font-medium text-[#0A2540] dark:text-white">881651234V</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Medical Registration No.</p>
                    <p className="text-sm font-medium text-[#0A2540] dark:text-white">SLMC-24817</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Specialization</p>
                    <p className="text-sm font-medium text-[#0A2540] dark:text-white">Cardiology</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Linked Institution</p>
                    <p className="text-sm font-medium text-[#0A2540] dark:text-white">Colombo General Hospital</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Verification Status</p>
                    <Badge variant="success" size="sm" className="bg-emerald-50 text-emerald-700 border-emerald-200 mt-1">
                      Verified - Documents on file
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Account Created</p>
                    <p className="text-sm font-medium text-[#0A2540] dark:text-white">12 Mar 2026, by Super Admin</p>
                  </div>
                </div>
              </Card>

              {/* Right Column: Account Activity */}
              <Card className="p-6 lg:col-span-1">
                <h3 className="text-lg font-bold text-[#0A2540] dark:text-white mb-1">
                  Account activity
                </h3>
                <p className="text-sm text-slate-500 mb-6">Snapshot of usage on Health Bridge</p>

                <div className="space-y-5 mb-8">
                  <div>
                    <span className="text-2xl font-bold text-[#0A2540] dark:text-white mr-2">1,204</span>
                    <span className="text-sm text-slate-500">consultations completed</span>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-[#0A2540] dark:text-white mr-2">4.8 / 5</span>
                    <span className="text-sm text-slate-500">average patient rating</span>
                  </div>
                  <div>
                    <span className="text-lg font-bold text-[#0A2540] dark:text-white mr-2">Today, 9:41 AM</span>
                    <span className="text-sm text-slate-500">last login</span>
                  </div>
                  <div>
                    <span className="text-lg font-bold text-[#0A2540] dark:text-white mr-2">Colombo, LK</span>
                    <span className="text-sm text-slate-500">last known location</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-sm font-semibold text-[#0A2540] dark:text-slate-300">Two-factor authentication</span>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-sm font-semibold text-[#0A2540] dark:text-slate-300">Email verified</span>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Verified</span>
                  </div>
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-sm font-semibold text-[#0A2540] dark:text-slate-300">Phone verified</span>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Verified</span>
                  </div>
                </div>
              </Card>

            </div>

            {/* Recent Login History */}
            <Card className="p-0 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-[#0A2540] dark:text-white mb-1">
                  Recent login history
                </h3>
                <p className="text-sm text-slate-500">Last 5 sign-ins to this account</p>
              </div>
              <Table className="border-0 shadow-none rounded-none w-full">
                <TableHeader className="bg-[#F8FAFC] dark:bg-slate-900/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-3">DATE & TIME</TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-3">DEVICE</TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-3">IP ADDRESS</TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-3">LOCATION</TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-3">STATUS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loginHistory.map((login, idx) => (
                    <TableRow key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                      <TableCell className="py-4">
                        <span className="text-xs text-slate-500">{login.time}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-xs font-semibold text-[#0A2540] dark:text-slate-300">{login.device}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-xs text-slate-500">{login.ip}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-xs text-slate-500">{login.location}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        {login.status === "Success" ? (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">Success</span>
                        ) : (
                          <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">Failed — blocked</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

          </div>
        )}
      </div>
    </>
  );
}
