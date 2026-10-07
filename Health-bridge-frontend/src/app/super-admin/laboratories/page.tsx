"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import axios from "@/lib/axios";

import { 
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  List,
  Download,
  Building2
} from "lucide-react";

export default function LaboratoryRegistrationsPage() {
  const [activeTab, setActiveTab] = useState("Pending");
  const [laboratories, setLaboratories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLaboratories();
  }, []);

  const fetchLaboratories = async () => {
    try {
      const data = await axios.get('/admin/laboratories');
      setLaboratories(data);
    } catch (error) {
      console.error("Failed to fetch laboratories:", error);
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = laboratories.filter(l => l.status === "Pending").length;
  const approvedCount = laboratories.filter(l => l.status === "Approved").length;
  const rejectedCount = laboratories.filter(l => l.status === "Rejected").length;
  const totalCount = laboratories.length;

  const filteredRegistrations = activeTab === "All" 
    ? laboratories 
    : laboratories.filter(lab => lab.status === activeTab);

  return (
    <>
      {/* 
        We use negative margins to break out of DashboardLayout's default padding 
        and apply a full white background to match the specific Figma design.
      */}
      <div className="flex flex-col gap-6 w-full p-4 sm:p-6 lg:p-8">
        
        <div className="w-full space-y-8">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-[#0052CC]">
              Laboratory Registrations
            </h1>
            <div className="w-full md:w-80">
              <Input 
                placeholder="Search Laboratory" 
                leftIcon={<Search size={18} className="text-slate-400" />}
                className="rounded-full bg-white border-slate-200"
              />
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <Card className="p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                  <Clock size={16} strokeWidth={2.5} />
                </div>
                <span className="text-sm font-bold text-orange-500">Pending</span>
              </div>
              <p className="text-3xl font-bold text-orange-500 ml-11">{pendingCount}</p>
            </Card>

            <Card className="p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 size={16} strokeWidth={2.5} />
                </div>
                <span className="text-sm font-bold text-emerald-500">Approved</span>
              </div>
              <p className="text-3xl font-bold text-emerald-500 ml-11">{approvedCount}</p>
            </Card>

            <Card className="p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                  <XCircle size={16} strokeWidth={2.5} />
                </div>
                <span className="text-sm font-bold text-red-500">Rejected</span>
              </div>
              <p className="text-3xl font-bold text-red-500 ml-11">{rejectedCount}</p>
            </Card>

          </div>

          {/* Tabs and Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            
            <div className="flex items-center gap-6 overflow-x-auto scrollbar-none">
              
              <button 
                onClick={() => setActiveTab("Pending")}
                className={`flex items-center gap-2 pb-4 -mb-[17px] transition-colors border-b-2 ${
                  activeTab === "Pending" ? "border-slate-800 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Clock size={16} />
                <span className="text-sm font-bold">Pending</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === "Pending" ? "bg-slate-100 text-slate-800" : "bg-slate-50 text-slate-400"
                }`}>{pendingCount}</span>
              </button>

              <button 
                onClick={() => setActiveTab("Approved")}
                className={`flex items-center gap-2 pb-4 -mb-[17px] transition-colors border-b-2 ${
                  activeTab === "Approved" ? "border-slate-800 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <CheckCircle2 size={16} />
                <span className="text-sm font-bold">Approved</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === "Approved" ? "bg-slate-100 text-slate-800" : "bg-slate-50 text-slate-400"
                }`}>{approvedCount}</span>
              </button>

              <button 
                onClick={() => setActiveTab("Rejected")}
                className={`flex items-center gap-2 pb-4 -mb-[17px] transition-colors border-b-2 ${
                  activeTab === "Rejected" ? "border-slate-800 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <XCircle size={16} />
                <span className="text-sm font-bold">Rejected</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === "Rejected" ? "bg-slate-100 text-slate-800" : "bg-slate-50 text-slate-400"
                }`}>{rejectedCount}</span>
              </button>

              <button 
                onClick={() => setActiveTab("All")}
                className={`flex items-center gap-2 pb-4 -mb-[17px] transition-colors border-b-2 ${
                  activeTab === "All" ? "border-slate-800 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <List size={16} />
                <span className="text-sm font-bold">All</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === "All" ? "bg-slate-100 text-slate-800" : "bg-slate-50 text-slate-400"
                }`}>{totalCount}</span>
              </button>

            </div>

            <Button variant="outline" leftIcon={<Download size={16} />} className="font-bold text-[#0052CC] border-[#0052CC] hover:bg-blue-50 px-6 rounded-lg shrink-0">
              Export Logs
            </Button>
          </div>

          {/* List View */}
          <div className="space-y-4 pt-4">
            {filteredRegistrations.map((item) => (
              <div key={item.labId} className="flex flex-col xl:flex-row xl:items-center gap-6 p-4 rounded-xl hover:bg-slate-50 transition-colors group">
                
                {/* Image and Name */}
                <div className="flex items-center gap-4 w-full xl:w-[350px] shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm overflow-hidden relative">
                     <Building2 size={24} className="opacity-80" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-bold text-[#0A2540] truncate">{item.name}</h3>
                      {item.status === "Approved" && <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />}
                    </div>
                    <p className="text-[11px] font-medium text-slate-500 truncate">{item.address}</p>
                  </div>
                </div>

                {/* Info Columns */}
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">License Number</p>
                    <p className="text-xs font-bold text-[#0A2540]">{item.license}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Owner</p>
                    <p className="text-xs font-bold text-[#0A2540]">{item.owner}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Request</p>
                    <p className="text-xs font-bold text-[#0A2540]">{item.requestDate}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Approved</p>
                    <p className="text-xs font-bold text-[#0A2540]">{item.approvedDate}</p>
                  </div>
                </div>

                {/* Action */}
                <div className="shrink-0 flex items-center justify-end">
                  {item.status === "Pending" ? (
                    <Link href={`/super-admin/laboratories/approvals/${item.labId}`}>
                      <button className="px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors">
                        Review
                      </button>
                    </Link>
                  ) : (
                    <Link href={`/super-admin/laboratories/${item.labId}`}>
                      <button className="px-5 py-2 rounded-full bg-blue-50 text-[#0052CC] hover:bg-blue-100 text-xs font-bold transition-colors">
                        View Active
                      </button>
                    </Link>
                  )}
                </div>

              </div>
            ))}
            
            {/* Empty State */}
            {filteredRegistrations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm font-medium text-slate-400">No {activeTab.toLowerCase()} registrations found.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
