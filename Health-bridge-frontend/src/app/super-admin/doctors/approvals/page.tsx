"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TablePagination } from "@/components/ui/Table";

import {
  Download,
  Check,
  X,
  Clock,
  Eye,
  ChevronRight
} from "lucide-react";

// Mock Data
const mockApprovals = [
  {
    id: "DOC-2026-00208",
    name: "Dr. Sophia Wilson",
    specialization: "Dermatologist",
    department: "Dermatology",
    hospital: "City General Hospital",
    submittedDate: "Aug 10, 2026",
    submittedTime: "2 days ago",
    docs: [true, true, false],
    status: "Pending Review",
    initials: "SW",
  },
  {
    id: "DOC-2026-00301",
    name: "Dr. Ravi Kumara",
    specialization: "Orthopedic Surgeon",
    department: "Orthopedics",
    hospital: "Lakeside Medical Center",
    submittedDate: "Aug 9, 2026",
    submittedTime: "3 days ago",
    docs: [true, true, true],
    status: "In Review",
    initials: "RK",
  },
  {
    id: "DOC-2026-00312",
    name: "Dr. Nadia Perera",
    specialization: "Neurologist",
    department: "Neurology",
    hospital: "City General Hospital",
    submittedDate: "Aug 8, 2026",
    submittedTime: "4 days ago",
    docs: [true, false, false],
    status: "Pending Review",
    initials: "NP",
  },
  {
    id: "DOC-2026-00318",
    name: "Dr. James Fonseka",
    specialization: "General Physician",
    department: "General Medicine",
    hospital: "Lakeside Medical Center",
    submittedDate: "Aug 7, 2026",
    submittedTime: "5 days ago",
    docs: [true, true, true],
    status: "Pending Review",
    initials: "JF",
  },
];

export default function DoctorApprovalsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Pending");

  const tabs = [
    { name: "Pending", count: 4 },
    { name: "Approved" },
    { name: "Rejected" },
    { name: "All Applications" },
  ];

  const getStatusBadge = (status: string) => {
    if (status === "Pending Review") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-500 text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Pending Review
        </span>
      );
    }
    if (status === "In Review") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-blue-200 bg-blue-50 text-[#0052CC] text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0052CC]" />
          In Review
        </span>
      );
    }
    return <Badge variant="neutral">{status}</Badge>;
  };

  const renderDocSquare = (isUploaded: boolean, idx: number) => {
    if (isUploaded) {
      return (
        <div key={idx} className="w-5 h-5 rounded flex items-center justify-center bg-cyan-100 text-cyan-600">
          <Check size={12} strokeWidth={3} />
        </div>
      );
    }
    return (
      <div key={idx} className="w-5 h-5 rounded flex items-center justify-center bg-slate-100 text-slate-300">
        <span className="font-bold text-xs">-</span>
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col gap-6 w-full p-4 sm:p-6 lg:p-8">
        
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
              <Link href="/super-admin/doctors" className="hover:text-slate-600 transition-colors">Manage Doctors</Link>
              <ChevronRight size={12} />
              <span className="text-[#0A2540] dark:text-slate-200">Registration Approvals</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Doctor Registration Approvals
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-3xl">
              Review submitted credentials and licensing documents, then approve or reject each doctor's registration before they gain platform access.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button variant="outline" leftIcon={<Download size={16} className="text-slate-500" />} className="font-bold text-slate-700 border-slate-200 hover:bg-slate-50">
              Export Report
            </Button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Review</p>
              <div className="w-7 h-7 rounded bg-red-50 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#0A2540] dark:text-white mb-1">4</p>
              <p className="text-xs font-medium text-slate-500">Awaiting decision</p>
            </div>
          </Card>
          
          <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submitted Today</p>
              <div className="w-7 h-7 rounded bg-blue-50 flex items-center justify-center text-[#0052CC]">
                <Clock size={14} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#0A2540] dark:text-white mb-1">2</p>
              <p className="text-xs font-medium text-slate-500">New applications</p>
            </div>
          </Card>

          <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Approved</p>
              <div className="w-7 h-7 rounded bg-cyan-50 flex items-center justify-center text-cyan-500">
                <Check size={14} strokeWidth={3} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#0A2540] dark:text-white mb-1">126</p>
              <p className="text-xs font-medium text-slate-500">This month</p>
            </div>
          </Card>

          <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rejected</p>
              <div className="w-7 h-7 rounded bg-orange-50 flex items-center justify-center text-orange-700">
                <X size={14} strokeWidth={3} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#0A2540] dark:text-white mb-1">6</p>
              <p className="text-xs font-medium text-slate-500">This month</p>
            </div>
          </Card>
        </div>

        {/* Tabs Row */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl w-max bg-white dark:bg-slate-900 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab.name
                  ? "bg-[#0052CC] text-white"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800"
              }`}
            >
              {tab.name}
              {tab.count !== undefined && (
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  activeTab === tab.name ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <Table className="border-0 shadow-none">
            <TableHeader className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4 pl-6">APPLICANT</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">DEPARTMENT</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">SUBMITTED</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">DOCUMENTS</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">STATUS</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4 pr-6">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockApprovals.map((doctor, index) => (
                <TableRow key={index} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 shrink-0 rounded-full bg-[#F0F5FF] text-[#0052CC] flex items-center justify-center font-bold text-sm">
                        {doctor.initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0A2540] dark:text-white">
                          {doctor.name}
                        </p>
                        <p className="text-[11px] font-medium text-slate-400">
                          {doctor.specialization} · {doctor.id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div>
                      <p className="text-sm font-bold text-[#0A2540] dark:text-white">
                        {doctor.department}
                      </p>
                      <p className="text-[11px] font-medium text-slate-400">
                        {doctor.hospital}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div>
                      <p className="text-sm font-bold text-[#0A2540] dark:text-white">
                        {doctor.submittedDate}
                      </p>
                      <p className="text-[11px] font-medium text-slate-400">
                        {doctor.submittedTime}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {doctor.docs.map((doc, idx) => renderDocSquare(doc, idx))}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    {getStatusBadge(doctor.status)}
                  </TableCell>
                  <TableCell className="py-4 pr-6">
                    <Link href={`/admin/doctors/approvals/${doctor.id}`} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#EBF3FF] hover:bg-blue-100 text-[#0052CC] rounded-full transition-colors text-xs font-bold">
                      <Eye size={14} />
                      Review
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <TablePagination 
            currentPage={currentPage}
            totalPages={1}
            totalRecords={4}
            pageSize={4}
            onPageChange={setCurrentPage}
          />
        </div>

      </div>
    </>
  );
}
