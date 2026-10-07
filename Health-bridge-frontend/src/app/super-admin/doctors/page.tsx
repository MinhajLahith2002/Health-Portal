"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TablePagination } from "@/components/ui/Table";

import {
  Plus,
  Download,
  CheckCircle2,
  Users,
  Clock,
  CalendarOff,
  AlertTriangle,
  Search,
  Edit,
  Trash2,
  Check
} from "lucide-react";

// Mock Data
const mockDoctors = [
  {
    id: "DOC-2026-00124",
    name: "Dr. Michael Roberts",
    specialization: "Cardiologist",
    department: "Cardiology",
    experience: "12 Years",
    availability: "On Duty",
    verification: "Verified",
    status: "Active",
    initials: "MR",
    isOn: true
  },
  {
    id: "DOC-2026-00142",
    name: "Dr. Emily Brown",
    specialization: "Pediatrician",
    department: "Pediatrics",
    experience: "8 Years",
    availability: "In Consultation",
    verification: "Verified",
    status: "Active",
    initials: "EB",
    isOn: true
  },
  {
    id: "DOC-2026-00208",
    name: "Dr. Sophia Wilson",
    specialization: "Dermatologist",
    department: "Dermatology",
    experience: "6 Years",
    availability: "Off Duty",
    verification: "Pending",
    status: "Inactive",
    initials: "SW",
    isOn: true
  },
];

export default function DoctorManagementPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const getAvailabilityBadge = (status: string) => {
    switch (status) {
      case "On Duty": 
        return <Badge variant="primary" dot size="sm" className="bg-cyan-50 text-cyan-700 border-cyan-200">On Duty</Badge>;
      case "In Consultation": 
        return <Badge variant="purple" dot size="sm" className="bg-purple-50 text-purple-700 border-purple-200">In Consultation</Badge>;
      case "Off Duty": 
        return <Badge variant="neutral" dot size="sm" className="bg-slate-100 text-slate-500 border-slate-200">Off Duty</Badge>;
      default: 
        return <Badge variant="neutral" dot size="sm">{status}</Badge>;
    }
  };

  const getVerificationBadge = (verification: string) => {
    if (verification === "Verified") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-600 uppercase">
          <Check size={12} className="text-cyan-600" />
          Verified
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Pending
      </span>
    );
  };

  return (
    <>
      <div className="flex flex-col gap-6 w-full p-4 sm:p-6 lg:p-8">
        
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Manage Doctors
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-3xl">
              Oversee every registered doctor across all hospitals — profiles, departments, credentials, schedules, availability, and account status.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href="/super-admin/doctors/add">
              <Button variant="primary" leftIcon={<Plus size={16} />} className="font-bold bg-[#0052CC] hover:bg-blue-700">
                Add New Doctor
              </Button>
            </Link>
            <Button variant="outline" leftIcon={<Download size={16} className="text-cyan-600" />} className="font-bold text-cyan-700 border-cyan-200 hover:bg-cyan-50">
              Export Doctors
            </Button>
            <Link href="/super-admin/doctors/approvals">
              <Button variant="primary" leftIcon={<CheckCircle2 size={16} />} className="font-bold bg-red-600 hover:bg-red-700 border-none shadow-sm text-white">
                Approve Registration
              </Button>
            </Link>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card className="p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Doctors</p>
              <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-white">
                <Users size={14} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#0A2540] dark:text-white mb-1">148</p>
              <p className="text-xs font-medium text-slate-500">Registered doctors</p>
            </div>
          </Card>
          
          <Card className="p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active</p>
              <div className="w-7 h-7 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
                <CheckCircle2 size={14} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#0A2540] dark:text-white mb-1">132</p>
              <p className="text-xs font-medium text-slate-500">Currently active</p>
            </div>
          </Card>

          <Card className="p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">On Duty Today</p>
              <div className="w-7 h-7 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
                <Clock size={14} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#0A2540] dark:text-white mb-1">86</p>
              <p className="text-xs font-medium text-slate-500">Available today</p>
            </div>
          </Card>

          <Card className="p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">On Leave</p>
              <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-[#B45309]">
                <CalendarOff size={14} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#0A2540] dark:text-white mb-1">12</p>
              <p className="text-xs font-medium text-slate-500">Currently unavailable</p>
            </div>
          </Card>

          <Card className="p-4 flex flex-col justify-between hover:shadow-md transition-shadow border border-red-100 dark:border-red-900/30">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending</p>
              <div className="w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
                <AlertTriangle size={14} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#0A2540] dark:text-white mb-1">4</p>
              <p className="text-xs font-medium text-slate-500">Awaiting approval</p>
            </div>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card className="p-3 flex flex-col lg:flex-row items-center gap-3">
          <div className="w-full lg:flex-1 lg:max-w-md">
            <Input 
              placeholder="Search doctor by name, ID, sp..." 
              leftIcon={<Search size={16} />}
              className="bg-[#F8FAFC]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <select className="h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-100 lg:w-32">
              <option>Department</option>
            </select>
            <select className="h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-100 lg:w-36">
              <option>Specialization</option>
            </select>
            <select className="h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-100 lg:w-32">
              <option>Availability</option>
            </select>
          </div>
          <div className="flex items-center gap-4 ml-auto w-full lg:w-auto mt-2 lg:mt-0 justify-end">
            <button className="text-sm font-bold text-slate-500 hover:text-slate-700">
              Clear Filters
            </button>
            <Button variant="primary" className="bg-[#0052CC] hover:bg-blue-700 font-bold px-6">
              Apply Filters
            </Button>
          </div>
        </Card>

        {/* Data Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <Table className="border-0 shadow-none">
            <TableHeader className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4 pl-6 w-16">ON</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">DOCTOR</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">ID & DEPARTMENT</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">EXPERIENCE</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">AVAILABILITY</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">STATUS</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4 text-right pr-8">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDoctors.map((doctor, index) => (
                <TableRow key={index} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <TableCell className="pl-6 py-4 align-middle">
                    <span className="text-xs font-semibold text-slate-700">on</span>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 shrink-0 rounded-full bg-blue-50 text-[#0052CC] border border-blue-100 flex items-center justify-center font-bold text-sm">
                        {doctor.initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0A2540] dark:text-white">
                          {doctor.name}
                        </p>
                        <p className="text-[11px] font-medium text-slate-400">
                          {doctor.specialization}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div>
                      <p className="text-sm font-bold text-[#0A2540] dark:text-white">
                        {doctor.id}
                      </p>
                      <p className="text-[11px] font-medium text-slate-400">
                        {doctor.department}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                      {doctor.experience}
                    </span>
                  </TableCell>
                  <TableCell className="py-4">
                    {getAvailabilityBadge(doctor.availability)}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-1 items-start">
                      {getVerificationBadge(doctor.verification)}
                      <Badge variant="neutral" size="sm" className="bg-slate-50 text-slate-600 border-slate-200 text-[10px] py-0 px-2 rounded-md">
                        {doctor.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <button className="w-8 h-8 flex items-center justify-center text-[#0052CC] border border-blue-200 hover:bg-blue-50 rounded-full transition-colors" title="Edit">
                        <Edit size={14} />
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center text-red-500 border border-red-200 hover:bg-red-50 rounded-full transition-colors" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <TablePagination 
            currentPage={currentPage}
            totalPages={50}
            totalRecords={148}
            pageSize={3}
            onPageChange={setCurrentPage}
          />
        </div>

      </div>
    </>
  );
}
