"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";

import { 
  History,
  Download,
  UserPlus,
  Plus,
  Shield,
  Users,
  Lock,
  AlertTriangle,
  Clock,
  Search,
  Building2,
  Stethoscope,
  Pill,
  ClipboardList,
  Copy,
  Ban,
  Edit2,
  ShieldAlert,
  Check
} from "lucide-react";

export default function RolesPermissionsPage() {
  
  const renderCheckbox = (checked: boolean, color: string = "blue") => {
    if (checked) {
      if (color === "red") {
        return (
          <div className="w-4 h-4 rounded bg-red-600 flex items-center justify-center">
            <Check size={12} className="text-white" strokeWidth={3} />
          </div>
        );
      }
      if (color === "green") {
        return (
          <div className="w-4 h-4 rounded bg-emerald-600 flex items-center justify-center">
            <Check size={12} className="text-white" strokeWidth={3} />
          </div>
        );
      }
      return (
        <div className="w-4 h-4 rounded bg-[#0052CC] flex items-center justify-center">
          <Check size={12} className="text-white" strokeWidth={3} />
        </div>
      );
    }
    return <div className="w-4 h-4 rounded border-2 border-slate-200 bg-white"></div>;
  };

  return (
    <>
      <div className="flex flex-col gap-6 w-full p-4 sm:p-6 lg:p-8">
        
        <div className="w-full space-y-6">
          
          {/* Header Section */}
          <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-6">
            <div className="max-w-2xl">
              <h1 className="text-[24px] font-bold text-[#0A2540] dark:text-white tracking-tight mb-2">
                Roles & Permissions
              </h1>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">
                Manage system roles, access levels, and permissions across all healthcare modules.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button variant="outline" leftIcon={<History size={14} />} className="font-bold text-slate-700 border-slate-200 hover:bg-slate-50 px-4 h-10 text-[13px] bg-white rounded-lg shadow-sm">
                View Audit Logs
              </Button>
              <Button variant="outline" leftIcon={<Download size={14} />} className="font-bold text-slate-700 border-slate-200 hover:bg-slate-50 px-4 h-10 text-[13px] bg-white rounded-lg shadow-sm">
                Export Permissions
              </Button>
              <Button variant="outline" leftIcon={<UserPlus size={14} />} className="font-bold text-slate-700 border-slate-200 hover:bg-slate-50 px-4 h-10 text-[13px] bg-white rounded-lg shadow-sm">
                Assign Users
              </Button>
              <Button variant="primary" leftIcon={<Plus size={16} />} className="font-bold bg-[#0052CC] hover:bg-blue-700 px-5 h-10 text-[13px] rounded-lg shadow-sm">
                Create New Role
              </Button>
            </div>
          </div>

          {/* Metrics Row (5 Cards) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card className="p-5 rounded-2xl border border-slate-200/60 shadow-sm bg-white">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={14} className="text-[#0052CC]" />
                <p className="text-[12px] font-medium text-slate-600">Total Roles</p>
              </div>
              <p className="text-2xl font-bold text-[#0A2540]">12</p>
            </Card>

            <Card className="p-5 rounded-2xl border border-slate-200/60 shadow-sm bg-white">
              <div className="flex items-center gap-2 mb-3">
                <Users size={14} className="text-emerald-600" />
                <p className="text-[12px] font-medium text-slate-600">Active Users</p>
              </div>
              <p className="text-2xl font-bold text-[#0A2540]">1,248</p>
            </Card>

            <Card className="p-5 rounded-2xl border border-slate-200/60 shadow-sm bg-white">
              <div className="flex items-center gap-2 mb-3">
                <Lock size={14} className="text-slate-500" />
                <p className="text-[12px] font-medium text-slate-600">Custom Roles</p>
              </div>
              <p className="text-2xl font-bold text-[#0A2540]">5</p>
            </Card>

            <Card className="p-5 rounded-2xl border border-red-200 shadow-sm bg-red-100">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={14} className="text-red-600" />
                <p className="text-[12px] font-bold text-red-700">High-Risk<br/>Permissions</p>
              </div>
              <p className="text-2xl font-bold text-red-600">8</p>
            </Card>

            <Card className="p-5 rounded-2xl border border-slate-200/60 shadow-sm bg-white">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={14} className="text-slate-500" />
                <p className="text-[12px] font-medium text-slate-600">Recent<br/>Changes (30d)</p>
              </div>
              <p className="text-2xl font-bold text-[#0A2540]">14</p>
            </Card>
          </div>

          {/* Master-Detail Layout */}
          <div className="flex flex-col lg:flex-row gap-6 items-stretch">
            
            {/* Left Sidebar (Role Navigation) */}
            <div className="w-full lg:w-[320px] shrink-0 space-y-4">
              
              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search roles..." 
                  className="w-full pl-9 pr-4 h-11 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] shadow-sm"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <button className="px-4 py-1.5 rounded-full bg-[#0052CC] text-white text-[11px] font-bold shadow-sm">All Roles</button>
                <button className="px-4 py-1.5 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 text-[11px] font-bold transition-colors">System</button>
                <button className="px-4 py-1.5 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 text-[11px] font-bold transition-colors">Custom</button>
              </div>

              {/* Role Cards List */}
              <div className="space-y-3">
                
                {/* Active Card */}
                <div className="p-4 rounded-xl bg-blue-100 border border-[#0052CC] cursor-pointer shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#0052CC]"></div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0052CC] flex items-center justify-center shrink-0">
                      <Building2 size={16} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-[14px] font-bold text-[#0A2540]">Hospital Admin</h3>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-600 text-[9px] font-bold">Active</span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-600 mb-4">System Role</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Users size={12} />
                          <span className="text-[10px] font-bold">42 Users</span>
                        </div>
                        <span className="text-[9px] text-slate-400">Updated 2d ago</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm cursor-pointer transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <Stethoscope size={16} className="text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-[14px] font-bold text-[#0A2540]">Head Physician</h3>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-600 text-[9px] font-bold">Active</span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 mb-4">System Role</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Users size={12} />
                          <span className="text-[10px] font-bold">128 Users</span>
                        </div>
                        <span className="text-[9px] text-slate-400">Updated 5d ago</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm cursor-pointer transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <Pill size={16} className="text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-[14px] font-bold text-[#0A2540]">Chief Pharmacist</h3>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-600 text-[9px] font-bold">Active</span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 mb-4">Custom Role</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Users size={12} />
                          <span className="text-[10px] font-bold">12 Users</span>
                        </div>
                        <span className="text-[9px] text-slate-400">Updated 1w ago</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm cursor-pointer transition-all opacity-70">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <ClipboardList size={16} className="text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-[14px] font-bold text-[#0A2540]">Temp Auditor</h3>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 text-[9px] font-bold">Inactive</span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-400 mb-4">Custom Role</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Users size={12} />
                          <span className="text-[10px] font-bold">0 Users</span>
                        </div>
                        <span className="text-[9px] text-slate-400">Updated 2m ago</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Panel (Details) */}
            <div className="flex-1 space-y-4">
              
              {/* Header Card */}
              <Card className="p-6 rounded-2xl border border-slate-200/60 shadow-sm bg-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#0052CC] flex items-center justify-center shrink-0 shadow-sm">
                      <Building2 size={24} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-lg font-bold text-[#0A2540]">Hospital Administrator</h2>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-600 text-[10px] font-bold uppercase tracking-wider">Active</span>
                      </div>
                      <p className="text-[13px] font-medium text-slate-500">
                        ID: <span className="font-bold text-slate-600">ROLE-SYS-002</span> • System Role • 42 Assigned Users
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
                      <Copy size={16} />
                    </button>
                    <button className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
                      <Ban size={16} />
                    </button>
                    <Button variant="primary" leftIcon={<Edit2 size={14} />} className="font-bold bg-[#0052CC] hover:bg-blue-700 px-5 rounded-lg h-10 shadow-sm">
                      Edit Role
                    </Button>
                  </div>
                </div>
              </Card>

              {/* AI Risk Analysis Alert */}
              <div className="p-5 rounded-xl bg-red-50 border border-red-100">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <ShieldAlert size={16} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[14px] font-bold text-red-700">AI Access Risk Analysis: HIGH</h3>
                      <a href="#" className="text-[12px] font-bold text-red-600 hover:underline">Review Recommendations</a>
                    </div>
                    <p className="text-[13px] font-medium text-red-600 leading-relaxed">
                      This role possesses both 'Delete Patient Record' and 'Approve Discharge' permissions. This combination violates Segregation of Duties (SoD) policies. Consider separating these privileges.
                    </p>
                  </div>
                </div>
              </div>

              {/* Permission Matrix */}
              <Card className="rounded-2xl border border-slate-200/60 shadow-sm bg-white overflow-hidden">
                
                {/* Matrix Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-[#0052CC]" />
                    <h3 className="text-[14px] font-bold text-[#0A2540]">Permission Matrix</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-blue-100"></div>
                      <span className="text-[11px] font-bold text-slate-500">Allowed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded border border-slate-200 bg-slate-50"></div>
                      <span className="text-[11px] font-bold text-slate-500">Denied</span>
                    </div>
                  </div>
                </div>

                {/* Matrix Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100">
                        <th className="py-4 pl-6 text-[13px] font-bold text-[#0A2540] w-[25%]">Module</th>
                        <th className="py-4 text-[13px] font-bold text-[#0A2540] text-center">View</th>
                        <th className="py-4 text-[13px] font-bold text-[#0A2540] text-center">Create</th>
                        <th className="py-4 text-[13px] font-bold text-[#0A2540] text-center">Edit</th>
                        <th className="py-4 text-[13px] font-bold text-red-600 text-center">Delete</th>
                        <th className="py-4 text-[13px] font-bold text-emerald-600 text-center">Approve</th>
                        <th className="py-4 text-[13px] font-bold text-[#0A2540] text-center">Export</th>
                        <th className="py-4 pr-6 text-[13px] font-bold text-[#0A2540] text-center">Manage</th>
                      </tr>
                    </thead>
                    <tbody>
                      
                      {/* User Management */}
                      <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-5 pl-6 text-[13px] font-bold text-slate-700">User Management</td>
                        <td className="py-5 text-center"><div className="flex justify-center">{renderCheckbox(true)}</div></td>
                        <td className="py-5 text-center"><div className="flex justify-center">{renderCheckbox(true)}</div></td>
                        <td className="py-5 text-center"><div className="flex justify-center">{renderCheckbox(true)}</div></td>
                        <td className="py-5 text-center"><div className="flex justify-center">{renderCheckbox(false)}</div></td>
                        <td className="py-5 text-center"><div className="flex justify-center">{renderCheckbox(false)}</div></td>
                        <td className="py-5 text-center"><div className="flex justify-center">{renderCheckbox(true)}</div></td>
                        <td className="py-5 pr-6 text-center"><div className="flex justify-center">{renderCheckbox(true)}</div></td>
                      </tr>

                      {/* Patient Records */}
                      <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-5 pl-6 text-[13px] font-bold text-slate-700">Patient Records</td>
                        <td className="py-5 text-center"><div className="flex justify-center">{renderCheckbox(true)}</div></td>
                        <td className="py-5 text-center"><div className="flex justify-center">{renderCheckbox(true)}</div></td>
                        <td className="py-5 text-center"><div className="flex justify-center">{renderCheckbox(true)}</div></td>
                        <td className="py-5 text-center"><div className="flex justify-center">{renderCheckbox(true, "red")}</div></td>
                        <td className="py-5 text-center"><div className="flex justify-center">{renderCheckbox(true, "green")}</div></td>
                        <td className="py-5 text-center"><div className="flex justify-center">{renderCheckbox(true)}</div></td>
                        <td className="py-5 pr-6 text-center"><div className="flex justify-center">{renderCheckbox(false)}</div></td>
                      </tr>

                      {/* Pharmacy & Inventory */}
                      <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-5 pl-6 text-[13px] font-bold text-slate-700">Pharmacy & Inventory</td>
                        <td className="py-5 text-center"><div className="flex justify-center">{renderCheckbox(true)}</div></td>
                        <td className="py-5 text-center"><div className="flex justify-center">{renderCheckbox(false)}</div></td>
                        <td className="py-5 text-center"><div className="flex justify-center">{renderCheckbox(false)}</div></td>
                        <td className="py-5 text-center"><div className="flex justify-center">{renderCheckbox(false)}</div></td>
                        <td className="py-5 text-center"><div className="flex justify-center">{renderCheckbox(true, "green")}</div></td>
                        <td className="py-5 text-center"><div className="flex justify-center">{renderCheckbox(true)}</div></td>
                        <td className="py-5 pr-6 text-center"><div className="flex justify-center">{renderCheckbox(false)}</div></td>
                      </tr>

                      {/* Billing & Insurance */}
                      <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-5 pl-6 text-[13px] font-bold text-slate-700">Billing & Insurance</td>
                        <td className="py-5 text-center"><div className="flex justify-center">{renderCheckbox(true)}</div></td>
                        <td className="py-5 text-center"><div className="flex justify-center">{renderCheckbox(true)}</div></td>
                        <td className="py-5 text-center"><div className="flex justify-center">{renderCheckbox(true)}</div></td>
                        <td className="py-5 text-center"><div className="flex justify-center">{renderCheckbox(false)}</div></td>
                        <td className="py-5 text-center"><div className="flex justify-center">{renderCheckbox(false)}</div></td>
                        <td className="py-5 text-center"><div className="flex justify-center">{renderCheckbox(true)}</div></td>
                        <td className="py-5 pr-6 text-center"><div className="flex justify-center">{renderCheckbox(true)}</div></td>
                      </tr>

                      {/* System Analytics */}
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-5 pl-6 text-[13px] font-bold text-slate-700">System Analytics</td>
                        <td className="py-5 text-center"><div className="flex justify-center">{renderCheckbox(true)}</div></td>
                        <td className="py-5 text-center"><div className="flex justify-center">{renderCheckbox(false)}</div></td>
                        <td className="py-5 text-center"><div className="flex justify-center">{renderCheckbox(false)}</div></td>
                        <td className="py-5 text-center"><div className="flex justify-center">{renderCheckbox(false)}</div></td>
                        <td className="py-5 text-center"><div className="flex justify-center">{renderCheckbox(false)}</div></td>
                        <td className="py-5 text-center"><div className="flex justify-center">{renderCheckbox(true)}</div></td>
                        <td className="py-5 pr-6 text-center"><div className="flex justify-center">{renderCheckbox(false)}</div></td>
                      </tr>

                    </tbody>
                  </table>
                </div>
              </Card>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}
