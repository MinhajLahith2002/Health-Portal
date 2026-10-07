"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";

import { 
  Search,
  Filter,
  PlusSquare,
  FileText,
  AlertCircle,
  CheckCircle2,
  Bell,
  HelpCircle
} from "lucide-react";

// Mock Data for Left Pane
const mockRequests = [
  {
    id: "1",
    category: "HOSPITAL",
    name: "Mercy General Hospital",
    time: "2h ago",
    npi: "1029384756",
    location: "Sacramento, CA",
    active: true
  },
  {
    id: "2",
    category: "PHARMACY",
    name: "CVS Health #4092",
    time: "5h ago",
    npi: "9876543210",
    location: "Austin, TX",
    active: false
  },
  {
    id: "3",
    category: "DOCTOR",
    name: "Dr. Sarah Jenkins, MD",
    time: "1d ago",
    npi: "4567891230",
    location: "Portland, OR",
    active: false
  }
];

export default function InsuranceApprovalsPage() {
  const [activeId, setActiveId] = useState("1");

  const renderCategoryBadge = (category: string) => {
    switch (category) {
      case "HOSPITAL":
        return <span className="px-2 py-0.5 bg-blue-100 text-[#0052CC] text-[9px] font-bold uppercase rounded">HOSPITAL</span>;
      case "PHARMACY":
        return <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[9px] font-bold uppercase rounded">PHARMACY</span>;
      case "DOCTOR":
        return <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 text-[9px] font-bold uppercase rounded">DOCTOR</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase rounded">{category}</span>;
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 w-full p-4 sm:p-6 lg:p-8">
        
        {/* Simulated Top Navbar for the specific design */}
        <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 z-10">
          <div className="w-[400px]">
            <Input 
              placeholder="Search institutions, NPI numbers..." 
              leftIcon={<Search size={16} className="text-slate-400" />}
              className="rounded-full bg-slate-50 border-slate-200 h-10"
            />
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button className="hover:text-slate-700 transition-colors"><Bell size={20} /></button>
            <button className="hover:text-slate-700 transition-colors"><HelpCircle size={20} /></button>
            <div className="w-8 h-8 rounded-full bg-slate-200 ml-2 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
               <span className="text-xs font-bold text-slate-500">JD</span>
            </div>
          </div>
        </div>

        {/* Master-Detail Split Pane */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Pane (Master List) */}
          <div className="w-[320px] lg:w-[350px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
            
            {/* List Header */}
            <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-white dark:bg-slate-900 sticky top-0">
              <div>
                <h2 className="text-lg font-bold text-[#0A2540] dark:text-white">Pending Approvals</h2>
                <p className="text-xs font-medium text-slate-500 mt-1">24 requires review</p>
              </div>
              <button className="p-2 text-[#0052CC] hover:bg-blue-50 rounded-lg transition-colors">
                <Filter size={20} />
              </button>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {mockRequests.map((req) => (
                <div 
                  key={req.id}
                  onClick={() => setActiveId(req.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    activeId === req.id 
                      ? "border-[#0052CC] bg-[#F0F5FF] shadow-sm" 
                      : "border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    {renderCategoryBadge(req.category)}
                    <span className={`text-[10px] font-medium ${activeId === req.id ? "text-[#0052CC]" : "text-slate-400"}`}>{req.time}</span>
                  </div>
                  <h3 className={`text-sm font-bold mb-1 ${activeId === req.id ? "text-[#0A2540]" : "text-[#0A2540]"}`}>
                    {req.name}
                  </h3>
                  <p className={`text-[11px] font-medium ${activeId === req.id ? "text-blue-800/70" : "text-slate-500"}`}>
                    NPI: {req.npi} • {req.location}
                  </p>
                </div>
              ))}
            </div>

          </div>

          {/* Right Pane (Detail View) */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-thin">
            <div className="max-w-[900px] mx-auto space-y-8 pb-10">
              
              {/* Profile Header */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-[#0052CC] shrink-0">
                    <PlusSquare size={28} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-[#0A2540] dark:text-white mb-2 leading-tight">
                      Mercy General Hospital
                    </h1>
                    <p className="text-xs font-medium text-slate-500">
                      Submitted by: Jane Doe (Admin) • <a href="mailto:jane.doe@mercygen.org" className="hover:underline">jane.doe@mercygen.org</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Button variant="outline" className="font-bold text-[#0052CC] border-[#0052CC] hover:bg-blue-50 px-6 h-10 rounded-xl">
                    Request More Info
                  </Button>
                  <Button variant="primary" className="font-bold bg-[#0052CC] hover:bg-blue-700 px-6 h-10 rounded-xl">
                    Approve Registration
                  </Button>
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Facility Type</p>
                  <p className="text-sm font-bold text-[#0A2540]">Acute Care Hospital</p>
                </Card>
                <Card className="p-4 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">NPI Number</p>
                  <p className="text-sm font-bold text-[#0A2540]">1029384756</p>
                </Card>
                <Card className="p-4 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Tax ID (EIN)</p>
                  <p className="text-sm font-bold text-[#0A2540]">XX-XXX4920</p>
                </Card>
              </div>

              {/* Documentation Status Table */}
              <div>
                <h3 className="text-lg font-bold text-[#0A2540] dark:text-white mb-4">Documentation Status</h3>
                <Card className="rounded-xl border border-slate-200/60 shadow-sm overflow-hidden bg-white">
                  
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/50 border-b border-slate-100">
                    <div className="col-span-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center md:text-left">DOCUMENT TYPE</div>
                    <div className="col-span-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">STATUS</div>
                    <div className="col-span-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center md:text-right">ACTION</div>
                  </div>

                  {/* Rows */}
                  <div className="divide-y divide-slate-100">
                    
                    {/* Row 1 */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-slate-50 transition-colors">
                      <div className="col-span-6 flex items-center gap-3">
                        <FileText size={18} className="text-slate-400 shrink-0" />
                        <span className="text-sm font-bold text-[#0A2540]">State State License</span>
                      </div>
                      <div className="col-span-3 flex justify-center">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">Verified</span>
                      </div>
                      <div className="col-span-3 flex justify-center md:justify-end">
                        <a href="#" className="text-xs font-bold text-[#0052CC] hover:underline">View PDF</a>
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-slate-50 transition-colors">
                      <div className="col-span-6 flex items-center gap-3">
                        <FileText size={18} className="text-slate-400 shrink-0" />
                        <span className="text-sm font-bold text-[#0A2540]">W-9 Form</span>
                      </div>
                      <div className="col-span-3 flex justify-center">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">Verified</span>
                      </div>
                      <div className="col-span-3 flex justify-center md:justify-end">
                        <a href="#" className="text-xs font-bold text-[#0052CC] hover:underline">View PDF</a>
                      </div>
                    </div>

                    {/* Row 3 */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-slate-50 transition-colors">
                      <div className="col-span-6 flex items-center gap-3">
                        <AlertCircle size={18} className="text-orange-500 shrink-0" />
                        <span className="text-sm font-bold text-[#0A2540]">Malpractice Insurance COI</span>
                      </div>
                      <div className="col-span-3 flex justify-center">
                        <span className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold border border-orange-200">Pending Manual Review</span>
                      </div>
                      <div className="col-span-3 flex justify-center md:justify-end">
                        <a href="#" className="text-xs font-bold text-[#0052CC] hover:underline">View PDF</a>
                      </div>
                    </div>

                  </div>
                </Card>
              </div>

              {/* Automated Compliance Checks */}
              <div>
                <h3 className="text-lg font-bold text-[#0A2540] dark:text-white mb-4">Automated Compliance Checks</h3>
                <div className="space-y-3">
                  
                  {/* Check 1 */}
                  <Card className="p-5 rounded-xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-200 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
                        <CheckCircle2 size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#0A2540] mb-0.5">OIG Exclusion List</h4>
                        <p className="text-xs font-medium text-slate-500">Entity not found on current exclusion list.</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 pl-12 md:pl-0">Checked today at 08:45 AM</span>
                  </Card>

                  {/* Check 2 */}
                  <Card className="p-5 rounded-xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-200 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
                        <CheckCircle2 size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#0A2540] mb-0.5">NPPES Registry Match</h4>
                        <p className="text-xs font-medium text-slate-500">NPI details match submitted registry data.</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 pl-12 md:pl-0">Checked today at 08:45 AM</span>
                  </Card>

                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}
