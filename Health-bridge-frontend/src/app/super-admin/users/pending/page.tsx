"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";

import {
  Download,
  Search,
  Filter,
  FileText,
  AlertCircle,
  Check,
  X,
  TrendingDown,
  TrendingUp
} from "lucide-react";

// Mock Data
const pendingUsers = [
  { 
    id: "SLMC-31582", 
    name: "Dr. Anjali Herath", 
    email: "anjali.herath@asiri.lk", 
    role: "Doctor", 
    institution: "Asiri Medical Group", 
    submitted: "01 Aug 2026, 4:12 PM", 
    documents: 3,
    initials: "AH", 
    color: "from-blue-600 to-indigo-600",
    warning: null
  },
  { 
    id: "PC-08841", 
    name: "Ruwan Senanayake", 
    email: "ruwan.senanayake@asiri.lk", 
    role: "Pharmacist", 
    institution: "Asiri Medical Group", 
    submitted: "29 Jul 2026, 10:30 AM", 
    documents: 4,
    initials: "RS", 
    color: "from-emerald-600 to-teal-600",
    warning: null
  },
  { 
    id: "MLT-14209", 
    name: "Thilini Fernando", 
    email: "thilini.f@nawaloka.lk", 
    role: "Lab Technician", 
    institution: "Nawaloka Hospitals", 
    submitted: "28 Jul 2026, 2:05 PM", 
    documents: 2,
    totalDocuments: 3,
    initials: "TF", 
    color: "from-purple-600 to-fuchsia-600",
    warning: "Missing document"
  },
  { 
    id: "INS-00932", 
    name: "Malith Jayasuriya", 
    email: "malith.j@ceylinco.lk", 
    role: "Insurance Officer", 
    institution: "Ceylinco Insurance", 
    submitted: "27 Jul 2026, 9:00 AM", 
    documents: 2,
    initials: "MJ", 
    color: "from-orange-500 to-red-500",
    warning: null
  },
  { 
    id: "HA-00512", 
    name: "Chamila Dias", 
    email: "chamila.dias@citydiag.lk", 
    role: "Hospital Admin", 
    institution: "CityDiag Laboratories", 
    submitted: "25 Jul 2026, 5:44 PM", 
    documents: 5,
    initials: "CD", 
    color: "from-blue-500 to-cyan-500",
    warning: null
  },
];

export default function PendingApprovalsPage() {
  const [activeTab, setActiveTab] = useState("All pending");

  const tabs = [
    { name: "All pending", count: "94" },
    { name: "Doctors", count: "41" },
    { name: "Pharmacists", count: "19" },
    { name: "Lab technicians", count: "14" },
    { name: "Insurance officers", count: "8" },
    { name: "Hospital admins", count: "12" },
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Doctor": return <Badge variant="primary" size="sm">{role}</Badge>;
      case "Pharmacist": return <Badge variant="success" size="sm">{role}</Badge>;
      case "Lab Technician": return <Badge variant="purple" size="sm">{role}</Badge>;
      case "Insurance Officer": return <Badge variant="warning" size="sm">{role}</Badge>;
      case "Hospital Admin": return <Badge variant="info" size="sm">{role}</Badge>;
      default: return <Badge variant="neutral" size="sm">{role}</Badge>;
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 w-full p-4 sm:p-6 lg:p-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Pending Approvals
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
              Review submitted credentials and documents to verify new professional and
              institutional registrations before activation.
            </p>
          </div>
          <Button variant="outline" leftIcon={<Download size={16} />} className="shrink-0">
            Export queue
          </Button>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className="p-5 flex flex-col justify-between">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Awaiting Review</p>
            <p className="text-3xl font-bold text-[#0A2540] dark:text-white mb-2">94</p>
            <p className="text-xs font-medium text-amber-600 dark:text-amber-500">Across all roles</p>
          </Card>
          
          <Card className="p-5 flex flex-col justify-between">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Avg. Review Time</p>
            <p className="text-3xl font-bold text-[#0A2540] dark:text-white mb-2">6.4 hrs</p>
            <div className="flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-500">
              <TrendingDown size={14} className="mr-1" />
              1.1 hrs vs last week
            </div>
          </Card>

          <Card className="p-5 flex flex-col justify-between">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Approved Today</p>
            <p className="text-3xl font-bold text-[#0A2540] dark:text-white mb-2">21</p>
            <div className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400">
              <TrendingUp size={14} className="mr-1 text-emerald-600 dark:text-emerald-500" />
              from 14 yesterday
            </div>
          </Card>

          <Card className="p-5 flex flex-col justify-between">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Rejected Today</p>
            <p className="text-3xl font-bold text-[#0A2540] dark:text-white mb-2">3</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Incomplete documentation</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 overflow-x-auto border-b border-slate-200 dark:border-slate-800 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`pb-4 text-sm font-semibold transition-colors relative whitespace-nowrap ${
                activeTab === tab.name
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {tab.name}
              <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-md ${
                activeTab === tab.name ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50" : "text-slate-400 bg-slate-100 dark:bg-slate-800"
              }`}>
                {tab.count}
              </span>
              {activeTab === tab.name && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="w-full md:flex-1 md:max-w-md">
            <Input 
              placeholder="Search by name, email or registration ID..." 
              leftIcon={<Search size={16} />}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select className="h-10 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-[#0A2540] dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 flex-1 md:w-36">
              <option>All roles</option>
              <option>Doctor</option>
              <option>Pharmacist</option>
            </select>
            <select className="h-10 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-[#0A2540] dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 flex-1 md:w-48">
              <option>Submitted: any time</option>
              <option>Last 24 hours</option>
              <option>Last 7 days</option>
            </select>
          </div>
          <Button variant="outline" leftIcon={<Filter size={16} />} className="ml-auto w-full md:w-auto text-slate-600 font-bold border-slate-200">
            More filters
          </Button>
        </div>

        {/* Card List View */}
        <div className="space-y-4">
          {pendingUsers.map((user, idx) => (
            <Card key={idx} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 hover:shadow-md transition-shadow border-slate-200">
              
              {/* Left Info Section */}
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 shrink-0 rounded-full bg-gradient-to-tr ${user.color} text-white font-bold flex items-center justify-center shadow-sm mt-1`}>
                  {user.initials}
                </div>
                
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link href={`/admin/users/${user.id}`} className="text-sm md:text-base font-bold text-[#0A2540] hover:text-[#0052CC] dark:text-white dark:hover:text-blue-400 transition-colors">
                      {user.name}
                    </Link>
                    {getRoleBadge(user.role)}
                    {user.warning && (
                      <Badge variant="warning" className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] uppercase font-bold py-0.5">
                        {user.warning}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-xs text-slate-500 font-medium">
                    {user.email} <span className="mx-1">•</span> {user.institution}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                    <span className="font-semibold text-slate-400">{user.id}</span>
                    <span className="text-slate-400">Submitted: {user.submitted}</span>
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md">
                      <FileText size={12} />
                      {user.totalDocuments ? `${user.documents} of ${user.totalDocuments}` : user.documents} documents attached
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Action Section */}
              <div className="flex items-center gap-2 shrink-0">
                {user.warning === "Missing document" ? (
                  <Button variant="outline" className="text-xs font-bold text-slate-700">
                    Request documents
                  </Button>
                ) : (
                  <Button variant="outline" className="text-xs font-bold text-slate-700">
                    View documents
                  </Button>
                )}
                
                <button className="flex items-center justify-center h-10 px-3 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 transition-colors font-bold text-xs">
                  Reject
                </button>
                
                <button className="flex items-center justify-center h-10 px-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm font-bold text-xs">
                  Approve
                </button>
              </div>

            </Card>
          ))}
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between pt-4 pb-12">
          <p className="text-xs text-slate-500 font-medium">
            Showing 5 of 94 pending registrations
          </p>
          <div className="flex items-center gap-1 text-sm font-medium">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-50" disabled>
              &lt;
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100">
              3
            </button>
            <span className="w-8 h-8 flex items-center justify-center text-slate-400">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100">
              19
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100">
              &gt;
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
