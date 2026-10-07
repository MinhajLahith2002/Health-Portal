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
  Search,
  ChevronRight,
  Bell,
  HelpCircle,
  FileText,
  BadgeCheck,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  XCircle,
  ArrowLeft
} from "lucide-react";

import { useRouter } from "next/navigation";

export default function ClaimsOversightPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClaims: 0,
    approvalRate: 0,
    flaggedFraud: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Pending Fraud Alerts
      const alertsRes: any = await axios.get('/fraud/alerts/pending');
      setAlerts(alertsRes || []);
      
      // Fetch Statistics
      const statsRes: any = await axios.get('/fraud/alerts/statistics');
      if (statsRes) {
        setStats({
          totalClaims: statsRes.totalClaimsProcessed || 0,
          approvalRate: statsRes.approvalRate || 0,
          flaggedFraud: statsRes.totalAlertsGenerated || alertsRes?.length || 0
        });
      }
    } catch (error) {
      console.error("Failed to fetch fraud alerts", error);
      toast.error("Failed to load fraud alerts from the server");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (alertId: string, action: 'approve' | 'reject') => {
    try {
      // In a real app, you might have specific endpoints like /fraud/alerts/{id}/review
      // Here we just use a generic update or remove from UI for demonstration
      await axios.put(`/fraud/alerts/${alertId}/status`, {
        status: action === 'approve' ? 'RESOLVED_FALSE_POSITIVE' : 'RESOLVED_FRAUD'
      });
      toast.success(`Alert ${action === 'approve' ? 'Cleared' : 'Confirmed'}!`);
      fetchData(); // Refresh the list
    } catch (error) {
      toast.error(`Failed to ${action} alert`);
    }
  };

  const renderRiskBadge = (score: number, severity: string) => {
    const isCritical = severity === "HIGH" || severity === "CRITICAL";
    
    if (isCritical) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold shadow-sm">
          <AlertTriangle size={12} strokeWidth={3} /> {score ? `${score}/100` : severity}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-600 text-xs font-bold shadow-sm">
        <span className="text-[10px] font-black">!</span> {score ? `${score}/100` : severity}
      </span>
    );
  };

  return (
    <>
      <div className="flex flex-col gap-6 w-full p-4 sm:p-6 lg:p-8">
        
        {/* Simulated Top Navbar */}
        <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between shrink-0">
          <div className="w-[450px]">
            <Input 
              placeholder="Claim ID number....." 
              leftIcon={<Search size={16} className="text-slate-400" />}
              className="rounded-full bg-slate-50 border-slate-100 h-10"
            />
          </div>
          <div className="flex items-center gap-5 text-slate-400">
            <button className="hover:text-slate-700 transition-colors"><Bell size={20} /></button>
            <button className="hover:text-slate-700 transition-colors"><HelpCircle size={20} /></button>
            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center shrink-0">
               <span className="text-xs font-bold text-slate-500">JD</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          <div className="mx-auto space-y-8">
            
            {/* Header */}
            <div className="flex justify-between items-end">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 mb-2">
                  <Link href="/super-admin/dashboard" className="hover:text-[#0052CC] transition-colors">Dashboard</Link>
                  <ChevronRight size={14} className="text-slate-400" />
                  <span className="text-[#0052CC]">Claims Oversight</span>
                </div>
                <h1 className="text-[32px] font-bold text-[#0A2540] dark:text-white tracking-tight">
                  Claims & Fraud Oversight
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={() => router.back()} variant="outline" leftIcon={<ArrowLeft size={14} />}>
                  Back
                </Button>
                <Button onClick={fetchData} variant="outline" leftIcon={<RefreshCw size={14} className={loading ? "animate-spin" : ""} />}>
                  Refresh Data
                </Button>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <Card className="p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
                <div className="absolute right-6 top-6 opacity-10">
                  <FileText size={64} />
                </div>
                <div className="relative z-10">
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Claims (MTD)</h3>
                  <p className="text-4xl font-bold text-[#0A2540] mb-2">{stats.totalClaims.toLocaleString()}</p>
                </div>
              </Card>

              <Card className="p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
                <div className="absolute right-6 top-6 opacity-10">
                  <BadgeCheck size={64} />
                </div>
                <div className="relative z-10">
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Approval Rate</h3>
                  <p className="text-4xl font-bold text-[#0A2540] mb-2">{stats.approvalRate}%</p>
                </div>
              </Card>

              <Card className="p-6 rounded-2xl border-none shadow-sm bg-[#FEE2E2] relative overflow-hidden">
                <div className="absolute right-6 top-6 opacity-10 text-red-900">
                  <ShieldAlert size={64} />
                </div>
                <div className="relative z-10">
                  <h3 className="text-[11px] font-bold text-red-800 uppercase tracking-widest mb-2">Flagged for Fraud</h3>
                  <p className="text-4xl font-bold text-red-600 mb-2">{stats.flaggedFraud.toLocaleString()}</p>
                  <div className="flex items-center gap-1.5 text-red-600 text-xs font-bold">
                    <AlertTriangle size={14} strokeWidth={2.5} />
                    <span>Requires Immediate Action</span>
                  </div>
                </div>
              </Card>

            </div>

            {/* Alerts Table */}
            <div className="w-full">
              <Card className="rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden bg-white">
                
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={20} className="text-red-500" />
                    <h2 className="text-lg font-bold text-[#0A2540]">Recent Suspicious Alerts</h2>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="border-b border-slate-100 hover:bg-transparent">
                        <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-4 pl-6">Alert ID</TableHead>
                        <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-4">Claim Ref</TableHead>
                        <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-4">Type</TableHead>
                        <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-4">Risk Score</TableHead>
                        <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-4 text-right pr-6">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-slate-500">Loading alerts...</TableCell>
                        </TableRow>
                      ) : alerts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-slate-500">No pending fraud alerts found.</TableCell>
                        </TableRow>
                      ) : alerts.map((alert, idx) => (
                        <TableRow key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <TableCell className="pl-6 py-5">
                            <span className="text-xs font-bold text-[#0A2540]">{alert.id.substring(0,8).toUpperCase()}</span>
                          </TableCell>
                          <TableCell className="py-5">
                            <span className="text-xs font-bold text-[#0A2540]">{alert.claimId || "Unknown"}</span>
                          </TableCell>
                          <TableCell className="py-5">
                            <span className="text-xs font-bold text-slate-500">{alert.alertType?.replace(/_/g, ' ')}</span>
                          </TableCell>
                          <TableCell className="py-5">
                            {renderRiskBadge(alert.riskScore, alert.severity)}
                          </TableCell>
                          <TableCell className="py-5 text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <Button onClick={() => handleAction(alert.id, 'approve')} size="sm" variant="outline" className="h-8 text-xs font-bold border-slate-200">
                                <CheckCircle size={14} className="mr-1 text-emerald-500" /> Clear
                              </Button>
                              <Button onClick={() => handleAction(alert.id, 'reject')} size="sm" className="h-8 text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 shadow-none border-none">
                                <XCircle size={14} className="mr-1" /> Flag
                              </Button>
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
        </div>
      </div>
    </>
  );
}
