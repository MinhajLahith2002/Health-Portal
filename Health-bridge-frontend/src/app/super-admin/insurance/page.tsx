"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import axios from "@/lib/axios";
import { toast } from "react-hot-toast";

import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/Table";

import { 
  ChevronRight,
  Home,
  Download,
  Plus,
  Search,
  Filter,
  Eye,
  UserCog,
  MoreVertical,
  ChevronLeft,
  X
} from "lucide-react";

export default function InsuranceRegistryPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response: any = await axios.get('/admin/insurance-providers');
      setProviders(response || []);
    } catch (error) {
      console.error("Failed to fetch providers", error);
      toast.error("Failed to load providers");
    } finally {
      setLoading(false);
    }
  };

  const updateProviderStatus = async (id: string, status: string) => {
    try {
      await axios.put(`/admin/insurance-providers/${id}/status`, { status });
      toast.success(`Provider status updated to ${status}`);
      setOpenDropdownId(null);
      fetchProviders();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const toggleAllRows = () => {
    if (selectedRows.length === providers.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(providers.map(p => p.id));
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] font-bold text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Approved
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100 text-[11px] font-bold text-amber-600">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pending
          </span>
        );
      case "Suspended":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-100 text-[11px] font-bold text-red-600">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Suspended
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 w-full p-4 sm:p-6 lg:p-8">
        
        <div className="w-full space-y-6">
          
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="w-full">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                <Home size={12} />
                <Link href="/super-admin/dashboard" className="hover:text-[#0052CC] transition-colors">Dashboard</Link>
                <ChevronRight size={12} />
                <span className="text-[#0A2540] dark:text-slate-200">Insurance Registry</span>
              </div>
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-[#0A2540] dark:text-white tracking-tight mb-2">
                    Insurance Provider Registry
                  </h1>
                  <p className="text-sm font-medium text-slate-500">
                    Manage onboarded insurance companies, verify licenses, and monitor coverage statuses.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Button onClick={fetchProviders} variant="outline" className="font-bold text-[#0052CC] border-[#0052CC] hover:bg-blue-50 px-5">
                    Refresh
                  </Button>
                  <Button variant="primary" leftIcon={<Plus size={16} />} className="font-bold bg-[#0052CC] hover:bg-blue-700 px-5">
                    Onboard Provider
                  </Button>
                </div>
              </div>

              {/* Module Navigation Tabs */}
              <div className="flex items-center gap-6 mt-6 border-b border-slate-100">
                <Link href="/super-admin/insurance" className="pb-3 text-sm font-bold text-[#0052CC] border-b-2 border-[#0052CC]">
                  Provider Registry
                </Link>
                <Link href="/super-admin/insurance/approvals" className="pb-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
                  Pending Approvals
                </Link>
                <Link href="/super-admin/insurance/claims" className="pb-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
                  Claims & Fraud
                </Link>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar Card */}
          <Card className="p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row items-end gap-4">
            
            {/* Search Input */}
            <div className="w-full md:w-[40%]">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Search Providers</label>
              <Input 
                placeholder="Search by name, license #, or region..." 
                leftIcon={<Search size={16} className="text-slate-400" />}
                className="rounded-xl bg-slate-50 border-slate-200 h-10"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Status</label>
              <div className="relative">
                <select className="w-full h-10 pl-3 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]">
                  <option>All Statuses</option>
                  <option>Approved</option>
                  <option>Pending</option>
                  <option>Suspended</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronRight size={14} className="rotate-90" />
                </div>
              </div>
            </div>

            {/* Region Filter */}
            <div className="w-full md:w-48">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Region</label>
              <div className="relative">
                <select className="w-full h-10 pl-3 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]">
                  <option>All Regions</option>
                  <option>North America</option>
                  <option>EU</option>
                  <option>APAC</option>
                  <option>LATAM</option>
                  <option>Global</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronRight size={14} className="rotate-90" />
                </div>
              </div>
            </div>

            {/* More Filters */}
            <div className="w-full md:w-auto shrink-0">
              <Button variant="outline" leftIcon={<Filter size={16} />} className="w-full font-bold text-slate-600 border-slate-200 hover:bg-slate-50 h-10 px-5 rounded-xl">
                More Filters
              </Button>
            </div>

          </Card>

          {/* Directory Table Card */}
          <Card className="rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden bg-white">
            
            {/* Table Header Area */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-[#0A2540] dark:text-white">Provider Directory</h2>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[11px] font-bold">{providers.length} Total Records</span>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white">
                  <TableRow className="border-b border-slate-100 hover:bg-transparent">
                    <TableHead className="w-12 pl-6">
                      <div className="flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-slate-300 text-[#0052CC] focus:ring-[#0052CC]" 
                          checked={selectedRows.length === providers.length && providers.length > 0}
                          onChange={toggleAllRows}
                        />
                      </div>
                    </TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-4">Company Name</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-4">License No.</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-4">Contact</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-4">Coverage Regions</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-4">Status</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-4 text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">Loading providers...</TableCell>
                    </TableRow>
                  ) : providers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">No providers found. Click "Seed Data" to generate some.</TableCell>
                    </TableRow>
                  ) : providers.map((provider) => (
                    <TableRow key={provider.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                      
                      {/* Checkbox */}
                      <TableCell className="pl-6">
                        <div className="flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-slate-300 text-[#0052CC] focus:ring-[#0052CC]" 
                            checked={selectedRows.includes(provider.id)}
                            onChange={() => toggleRowSelection(provider.id)}
                          />
                        </div>
                      </TableCell>

                      {/* Company Name */}
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${provider.logoColor}`}>
                            {provider.logoText}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#0A2540]">{provider.name}</p>
                            <p className="text-[11px] font-medium text-slate-400">ID: {provider.providerId}</p>
                          </div>
                        </div>
                      </TableCell>

                      {/* License */}
                      <TableCell className="py-4">
                        <p className="text-sm font-bold text-[#0A2540] w-32">{provider.licenseNo}</p>
                      </TableCell>

                      {/* Contact */}
                      <TableCell className="py-4">
                        <p className="text-sm font-bold text-[#0A2540]">{provider.contactName}</p>
                        <p className="text-[11px] font-medium text-slate-500">{provider.contactRole}</p>
                      </TableCell>
                      
                      {/* Regions */}
                      <TableCell className="py-4">
                        <div className="flex flex-wrap gap-1.5 w-40">
                          {provider.coverageRegions?.map((r: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                              {r}
                            </span>
                          ))}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-4">
                        {renderStatusBadge(provider.status)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-4 pr-6 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setSelectedProvider(provider)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#0052CC] hover:bg-blue-50 transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors">
                            <UserCog size={16} />
                          </button>
                          <div className="relative">
                            <button 
                              onClick={() => setOpenDropdownId(openDropdownId === provider.id ? null : provider.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {openDropdownId === provider.id && (
                              <div className="absolute right-0 top-10 w-48 bg-white border border-slate-200 shadow-xl rounded-lg overflow-hidden z-50">
                                <ul className="flex flex-col py-1">
                                  <li>
                                    <button 
                                      onClick={() => updateProviderStatus(provider.providerId, 'Approved')}
                                      className="w-full text-left px-4 py-2 text-sm font-bold text-green-600 hover:bg-green-50"
                                    >
                                      ✓ Set as Approved
                                    </button>
                                  </li>
                                  <li>
                                    <button 
                                      onClick={() => updateProviderStatus(provider.providerId, 'Pending')}
                                      className="w-full text-left px-4 py-2 text-sm font-bold text-orange-500 hover:bg-orange-50"
                                    >
                                      ⚠ Set as Pending
                                    </button>
                                  </li>
                                  <li>
                                    <button 
                                      onClick={() => updateProviderStatus(provider.providerId, 'Suspended')}
                                      className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
                                    >
                                      ✗ Suspend License
                                    </button>
                                  </li>
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
          
        </div>
      </div>

      {/* Provider Details Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${selectedProvider.logoColor}`}>
                  {selectedProvider.logoText}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0A2540]">{selectedProvider.name}</h3>
                  <p className="text-xs font-medium text-slate-500">ID: {selectedProvider.providerId}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProvider(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">License No</p>
                  <p className="text-sm font-bold text-[#0A2540]">{selectedProvider.licenseNo}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <div>{renderStatusBadge(selectedProvider.status)}</div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Primary Contact</p>
                <p className="text-sm font-bold text-[#0A2540]">{selectedProvider.contactName}</p>
                <p className="text-xs font-medium text-slate-500">{selectedProvider.contactRole}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Coverage Regions</p>
                <div className="flex flex-wrap gap-2">
                  {selectedProvider.coverageRegions?.map((r: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-[#0052CC]/10 text-[#0052CC] text-xs font-bold">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <Button onClick={() => setSelectedProvider(null)} variant="outline" className="font-bold text-slate-600">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
