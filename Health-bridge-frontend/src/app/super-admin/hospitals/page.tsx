"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TablePagination } from "@/components/ui/Table";
import Link from "next/link";

import {
  Plus,
  Calendar,
  Download,
  Edit,
  Trash2,
  Building2
} from "lucide-react";

// Mock Data
const mockHospitals = [
  { 
    id: "HOSP-1042", 
    name: "Mercy General Hospital", 
    address: "123 Health Ave, New York, NY", 
    phone: "+1 (555) 123-4567", 
    email: "admin@mercygen.org", 
    status: "Active" 
  },
  { 
    id: "HOSP-2091", 
    name: "Oakridge Medical Center", 
    address: "450 Pine St, Seattle, WA", 
    phone: "+1 (555) 987-6543", 
    email: "contact@oakridge.med", 
    status: "Active" 
  },
  { 
    id: "HOSP-3310", 
    name: "Valley View Clinic", 
    address: "789 Valley Rd, Austin, TX", 
    phone: "+1 (555) 321-0987", 
    email: "info@valleyview.org", 
    status: "Inactive" 
  },
];

export default function HospitalManagementPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active": return <Badge variant="success" dot size="sm" className="bg-emerald-100 text-emerald-800 border-emerald-200">Active</Badge>;
      case "Inactive": return <Badge variant="neutral" dot size="sm" className="bg-slate-100 text-slate-700 border-slate-200">Inactive</Badge>;
      default: return <Badge variant="neutral" dot size="sm">{status}</Badge>;
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 w-full p-4 sm:p-6 lg:p-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Hospital Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Manage and monitor registered healthcare facilities.
            </p>
          </div>
          <Link href="/super-admin/hospitals/add">
            <Button variant="primary" leftIcon={<Plus size={16} />} className="shrink-0 font-bold bg-[#0052CC] hover:bg-blue-700">
              Add Hospital
            </Button>
          </Link>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <div className="relative">
            <select className="appearance-none h-10 pl-9 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-sm">
              <option>Last 30 Days</option>
              <option>Last 3 Months</option>
              <option>This Year</option>
              <option>All Time</option>
            </select>
            <Calendar size={16} className="absolute left-3 top-3 text-slate-500 pointer-events-none" />
            <div className="absolute right-3 top-3 text-slate-500 pointer-events-none">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
          
          <Button variant="primary" leftIcon={<Download size={16} />} className="font-semibold shadow-sm bg-[#0052CC] hover:bg-blue-700 rounded-lg h-10">
            Generate Report
          </Button>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden mt-4">
          <Table className="border-0 shadow-none">
            <TableHeader className="bg-[#F8FAFC] dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-4 pl-6">HOSPITAL NAME</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-4">LOCATION</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-4">CONTACT</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-4">STATUS</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-4 text-right pr-8">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockHospitals.map((hospital, index) => (
                <TableRow key={index} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 shrink-0 rounded-lg bg-blue-50 text-[#0052CC] border border-blue-100 flex items-center justify-center mt-0.5">
                        <Building2 size={20} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-[#0A2540] dark:text-white">
                          {hospital.name}
                        </p>
                        <p className="text-xs font-semibold text-slate-500">
                          ID: {hospital.id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      {hospital.address}
                    </span>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        {hospital.phone}
                      </p>
                      <p className="text-sm font-medium text-slate-500">
                        {hospital.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    {getStatusBadge(hospital.status)}
                  </TableCell>
                  <TableCell className="py-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 text-slate-400 hover:text-[#0052CC] hover:bg-[#EBF3FF] rounded-lg transition-colors" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <TablePagination 
            currentPage={currentPage}
            totalPages={8}
            totalRecords={24}
            pageSize={3}
            onPageChange={setCurrentPage}
          />
        </div>

      </div>
    </>
  );
}
