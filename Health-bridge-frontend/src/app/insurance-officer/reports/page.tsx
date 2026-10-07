"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Building2,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent, StatCard } from "@/components/ui/Card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loader from "@/components/ui/Loader";
import { insuranceService } from "@/services/insuranceService";
import { ClaimStatus, InsuranceReportSummary } from "@/types/insurance";

import { generateInsuranceOfficerReportPdf } from "@/lib/insurancePdfGenerator";

const statusVariant: Record<ClaimStatus, "success" | "danger" | "warning" | "primary"> = {
  APPROVED: "success",
  PAID: "primary",
  SUBMITTED: "primary",
  UNDER_REVIEW: "warning",
  REJECTED: "danger",
};

type DatePreset = "ALL" | "7D" | "30D" | "YTD" | "CUSTOM";
type ReportTab = "CLAIMS" | "DECISIONS" | "PROVIDERS";

export default function InsuranceReportsPage() {
  const [report, setReport] = useState<InsuranceReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [preset, setPreset] = useState<DatePreset>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState<ReportTab>("CLAIMS");
  const [searchTerm, setSearchTerm] = useState("");
  const [claimsPage, setClaimsPage] = useState(1);
  const [rejectedPage, setRejectedPage] = useState(1);
  const [providersPage, setProvidersPage] = useState(1);
  const pageSize = 6;

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  const fetchReport = useCallback((start?: string, end?: string) => {
    setLoading(true);
    insuranceService
      .getReportSummary(start, end)
      .then((data) => {
        setReport(data);
        setErrorMessage(null);
      })
      .catch(() => {
        showError("Failed to load insurance reports data from server");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let isMounted = true;
    insuranceService
      .getReportSummary()
      .then((data) => {
        if (isMounted) {
          setReport(data);
          setErrorMessage(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setErrorMessage("Failed to load insurance reports data from server");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePresetChange = (newPreset: DatePreset) => {
    setPreset(newPreset);
    setClaimsPage(1);
    setRejectedPage(1);
    setProvidersPage(1);
    const now = new Date();
    let startStr = "";
    const endStr = now.toISOString().split("T")[0];

    if (newPreset === "7D") {
      const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      startStr = past7.toISOString().split("T")[0];
      setStartDate(startStr);
      setEndDate(endStr);
      fetchReport(startStr, endStr);
    } else if (newPreset === "30D") {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      startStr = past30.toISOString().split("T")[0];
      setStartDate(startStr);
      setEndDate(endStr);
      fetchReport(startStr, endStr);
    } else if (newPreset === "YTD") {
      startStr = `${now.getFullYear()}-01-01`;
      setStartDate(startStr);
      setEndDate(endStr);
      fetchReport(startStr, endStr);
    } else if (newPreset === "ALL") {
      setStartDate("");
      setEndDate("");
      fetchReport();
    }
  };

  const handleCustomFilter = () => {
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      showError("End date cannot be before start date");
      return;
    }
    setClaimsPage(1);
    setRejectedPage(1);
    setProvidersPage(1);
    fetchReport(startDate || undefined, endDate || undefined);
  };

  // PDF Export Generator
  const exportToPDF = () => {
    if (!report) {
      showError("No claim records available to export");
      return;
    }

    const presetNames: Record<DatePreset, string> = {
      ALL: "All Time",
      "7D": "Last 7 Days",
      "30D": "Last 30 Days",
      YTD: "Year to Date",
      CUSTOM: `${startDate || "Start"} to ${endDate || "End"}`,
    };

    try {
      const pdfBlob = generateInsuranceOfficerReportPdf(report, presetNames[preset] || "All Time");
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Insurance_Report_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showSuccess("Insurance report downloaded as PDF");
    } catch {
      showError("Failed to generate PDF report.");
    }
  };

  // Filtered claims for search
  const filteredClaims = useMemo(() => {
    if (!report?.claims) return [];
    if (!searchTerm.trim()) return report.claims;
    const term = searchTerm.toLowerCase();
    return report.claims.filter(
      (c) =>
        c.claimNumber.toLowerCase().includes(term) ||
        c.patientId.toLowerCase().includes(term) ||
        (c.treatmentDescription && c.treatmentDescription.toLowerCase().includes(term))
    );
  }, [report, searchTerm]);

  // Donut chart status split data
  const statusChartData = useMemo(() => {
    if (!report) return [];
    const items = [
      { name: "Approved", value: report.approvedClaims, color: "#10B981" },
      { name: "Pending", value: report.pendingClaims, color: "#F59E0B" },
      { name: "Rejected", value: report.rejectedClaims, color: "#EF4444" },
      { name: "Paid", value: report.paidClaims, color: "#3B82F6" },
    ];
    return items.filter((i) => i.value > 0);
  }, [report]);

  // Area chart monthly trend data
  const monthlyTrendData = useMemo(() => {
    if (!report?.monthlyTrends || report.monthlyTrends.length === 0) return [];
    return report.monthlyTrends.map((t) => ({
      month: t.month,
      claims: t.claimCount,
      approved: t.approvedCount,
      requestedAmount: Number((t.totalRequested / 1000).toFixed(2)),
      approvedAmount: Number((t.totalApproved / 1000).toFixed(2)),
    }));
  }, [report]);

  return (
    <DashboardLayout pageTitle="Insurance Reports" userRole="INSURANCE_OFFICER">
      <div className="space-y-6">
        {/* Top Header & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
              <span>Insurance</span>
              <span>/</span>
              <span className="text-slate-400">Reports & Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A2540] tracking-tight">
              Insurance Reports & Analytics
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Analyze claim trends, payout distributions, policy coverage, and export stakeholder reports.
            </p>
          </div>

          {/* Export Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={exportToPDF}
              className="shadow-sm whitespace-nowrap"
            >
              Export PDF
            </Button>
          </div>
        </div>

        {/* Feedback Banners */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex items-center gap-2 animate-in fade-in duration-200">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Date Filter Bar */}
        <Card className="p-4 bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(["ALL", "7D", "30D", "YTD", "CUSTOM"] as DatePreset[]).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePresetChange(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    preset === p
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {p === "ALL" && "All Time"}
                  {p === "7D" && "Last 7 Days"}
                  {p === "30D" && "Last 30 Days"}
                  {p === "YTD" && "Year to Date"}
                  {p === "CUSTOM" && "Custom Range"}
                </button>
              ))}
            </div>

            {/* Custom Date Inputs */}
            {preset === "CUSTOM" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
                <span className="text-slate-400 text-xs">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
                <Button size="sm" onClick={handleCustomFilter}>
                  Apply
                </Button>
              </div>
            )}
          </div>
        </Card>

        {loading ? (
          <Loader />
        ) : !report ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No report data generated</p>
          </div>
        ) : (
          <>
            {/* Primary KPI Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Claims Volume"
                value={report.totalClaims.toLocaleString()}
                icon={<FileText className="w-5 h-5 text-blue-600" />}
                iconBgColor="bg-blue-50"
                subtitle={`Rs. ${report.totalClaimAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} claimed`}
              />

              <StatCard
                title="Total Approved Payout"
                value={`Rs. ${report.totalApprovedAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                iconBgColor="bg-emerald-50"
                trend={{
                  value: `${report.approvalRate?.toFixed(1)}%`,
                  isPositive: report.approvalRate >= 50,
                  label: "approval rate",
                }}
              />

              <StatCard
                title="Avg Turnaround Time"
                value={
                  report.averageProcessingTimeHours > 0
                    ? `${report.averageProcessingTimeHours.toFixed(1)} hrs`
                    : "< 1 hr"
                }
                icon={<Clock className="w-5 h-5 text-amber-600" />}
                iconBgColor="bg-amber-50"
                subtitle={`${report.pendingClaims} pending review`}
              />

              <StatCard
                title="Policy Coverage Utilization"
                value={`${report.policyUtilizationRate?.toFixed(1)}%`}
                icon={<Building2 className="w-5 h-5 text-purple-600" />}
                iconBgColor="bg-purple-50"
                subtitle={`Rs. ${report.totalCoverageUsed?.toLocaleString()} of Rs. ${report.totalCoverageIssued?.toLocaleString()}`}
              />
            </div>

            {/* Visual Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trend Chart */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-base font-bold text-[#0A2540]">
                      Claims Volume & Disbursed Amounts
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">Historical submission and payout volume (Rs. in thousands)</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span className="text-slate-600">Volume</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-slate-600">Payout (Rs. &apos;000)</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="repVolume" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="repPayout" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#FFFFFF",
                            borderRadius: "12px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                            border: "1px solid #E2E8F0",
                            fontSize: "12px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="claims"
                          name="Total Claims"
                          stroke="#3B82F6"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#repVolume)"
                        />
                        <Area
                          type="monotone"
                          dataKey="approvedAmount"
                          name="Payout (Rs. '000)"
                          stroke="#10B981"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#repPayout)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Status Breakdown Donut */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-[#0A2540]">
                    Claims Status Ratio
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">Decision distribution</p>
                </CardHeader>

                <CardContent className="pt-2">
                  {statusChartData.length === 0 ? (
                    <div className="h-56 w-full flex flex-col items-center justify-center text-center p-4">
                      <div className="w-16 h-16 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center mb-3">
                        <Clock className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700">No Claims in Selected Period</p>
                    </div>
                  ) : (
                    <>
                      <div className="h-56 w-full relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={statusChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={80}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {statusChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value) => [`${value} claims`, "Count"]}
                              contentStyle={{
                                backgroundColor: "#FFFFFF",
                                borderRadius: "12px",
                                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                border: "1px solid #E2E8F0",
                                fontSize: "12px",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="mt-2 space-y-2 text-xs">
                        {statusChartData.map((item) => (
                          <div key={item.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-slate-600 font-medium">{item.name}</span>
                            </div>
                            <span className="font-bold text-[#0A2540]">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Categorized Detailed Report Tables (SRS 11.6) */}
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("CLAIMS")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === "CLAIMS"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Claims Performance Report
                  </button>
                  <button
                    onClick={() => setActiveTab("DECISIONS")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === "DECISIONS"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Approval & Rejection Breakdown
                  </button>
                  <button
                    onClick={() => setActiveTab("PROVIDERS")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === "PROVIDERS"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Provider & Policy Summary
                  </button>
                </div>

                {activeTab === "CLAIMS" && (
                  <div className="w-full sm:w-64">
                    <Input
                      placeholder="Search claims or patient..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setClaimsPage(1);
                      }}
                    />
                  </div>
                )}
              </CardHeader>

              <CardContent className="pt-4">
                {/* Tab 1: Claims Performance Report */}
                {activeTab === "CLAIMS" && (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Claim Number</TableHead>
                          <TableHead>Patient ID</TableHead>
                          <TableHead>Treatment</TableHead>
                          <TableHead>Claim Amount</TableHead>
                          <TableHead>Approved Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredClaims.length === 0 ? (
                          <TableEmpty colSpan={8} message="No claims matching the selected filters" />
                        ) : (
                          filteredClaims
                            .slice((claimsPage - 1) * pageSize, claimsPage * pageSize)
                            .map((c) => (
                              <TableRow key={c.id}>
                                <TableCell className="font-semibold text-blue-600">{c.claimNumber}</TableCell>
                                <TableCell className="font-medium text-slate-700">{c.patientId}</TableCell>
                                <TableCell className="max-w-xs truncate text-slate-600">
                                  {c.treatmentDescription || "General Treatment"}
                                </TableCell>
                                <TableCell className="font-bold text-[#0A2540]">
                                  Rs. {c.claimAmount != null ? Number(c.claimAmount).toFixed(2) : "0.00"}
                                </TableCell>
                                <TableCell className="font-semibold text-emerald-600">
                                  {c.approvedAmount != null ? `Rs. ${Number(c.approvedAmount).toFixed(2)}` : "—"}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={statusVariant[c.status]}>{c.status}</Badge>
                                </TableCell>
                                <TableCell className="text-xs text-slate-500">
                                  {c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : "—"}
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center">
                                    <Link href={`/insurance-officer/claims/${c.id}`}>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                                        className="h-7 text-xs px-2.5 min-w-[76px] whitespace-nowrap"
                                      >
                                        View
                                      </Button>
                                    </Link>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                        )}
                      </TableBody>
                    </Table>

                    {/* 6-Record Pagination Controls for Tab 1 (Screenshot 2) */}
                    {filteredClaims.length > 0 && Math.ceil(filteredClaims.length / pageSize) > 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-white rounded-b-2xl gap-3 text-xs text-slate-500">
                        <div>
                          Showing <span className="font-semibold text-[#0A2540]">{(claimsPage - 1) * pageSize + 1}</span> to{" "}
                          <span className="font-semibold text-[#0A2540]">{Math.min(claimsPage * pageSize, filteredClaims.length)}</span> of{" "}
                          <span className="font-semibold text-[#0A2540]">{filteredClaims.length}</span> claims
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setClaimsPage((p) => Math.max(1, p - 1))}
                            disabled={claimsPage === 1}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-all"
                          >
                            Previous
                          </button>

                          {Array.from({ length: Math.ceil(filteredClaims.length / pageSize) }, (_, i) => i + 1).map((pageNum) => (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => setClaimsPage(pageNum)}
                              className={`w-8 h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                                claimsPage === pageNum
                                  ? "bg-blue-600 text-white shadow-xs"
                                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          ))}

                          <button
                            type="button"
                            onClick={() => setClaimsPage((p) => Math.min(Math.ceil(filteredClaims.length / pageSize), p + 1))}
                            disabled={claimsPage === Math.ceil(filteredClaims.length / pageSize)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-all"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Tab 2: Decision Breakdown & Rejections */}
                {activeTab === "DECISIONS" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50">
                        <p className="text-xs font-semibold text-emerald-700 uppercase">Approved Claims</p>
                        <p className="text-2xl font-bold text-emerald-800 mt-1">{report.approvedClaims}</p>
                        <p className="text-xs text-emerald-600 mt-1">
                          Total Approved: Rs. {report.totalApprovedAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl border border-red-100 bg-red-50/50">
                        <p className="text-xs font-semibold text-red-700 uppercase">Rejected Claims</p>
                        <p className="text-2xl font-bold text-red-800 mt-1">{report.rejectedClaims}</p>
                        <p className="text-xs text-red-600 mt-1">
                          Rejected Value: Rs. {report.totalRejectedAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/50">
                        <p className="text-xs font-semibold text-amber-700 uppercase">Pending In-Review</p>
                        <p className="text-2xl font-bold text-amber-800 mt-1">{report.pendingClaims}</p>
                        <p className="text-xs text-amber-600 mt-1">
                          Pending Value: Rs. {report.totalPendingAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                      <h4 className="text-sm font-bold text-[#0A2540] mb-3">Rejected Claims Log & Reasons</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Claim #</TableHead>
                            <TableHead>Patient ID</TableHead>
                            <TableHead>Claim Amount</TableHead>
                            <TableHead>Rejection Reason</TableHead>
                            <TableHead>Reviewed Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {report.claims.filter((c) => c.status === "REJECTED").length === 0 ? (
                            <TableEmpty colSpan={5} message="No rejected claims in this period" />
                          ) : (
                            report.claims
                              .filter((c) => c.status === "REJECTED")
                              .slice((rejectedPage - 1) * pageSize, rejectedPage * pageSize)
                              .map((c) => (
                                <TableRow key={c.id}>
                                  <TableCell className="font-semibold text-red-600">{c.claimNumber}</TableCell>
                                  <TableCell className="text-slate-700">{c.patientId}</TableCell>
                                  <TableCell className="font-bold text-[#0A2540]">Rs. {c.claimAmount?.toFixed(2)}</TableCell>
                                  <TableCell className="text-red-700 font-medium">
                                    {c.rejectionReason || "Eligibility criteria not met"}
                                  </TableCell>
                                  <TableCell className="text-xs text-slate-500">
                                    {c.reviewedAt ? new Date(c.reviewedAt).toLocaleDateString() : "—"}
                                  </TableCell>
                                </TableRow>
                              ))
                          )}
                        </TableBody>
                      </Table>

                      {/* 6-Record Pagination for Tab 2 */}
                      {report.claims.filter((c) => c.status === "REJECTED").length > pageSize && (
                        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-white rounded-b-2xl gap-3 text-xs text-slate-500">
                          <div>
                            Showing <span className="font-semibold text-[#0A2540]">{(rejectedPage - 1) * pageSize + 1}</span> to{" "}
                            <span className="font-semibold text-[#0A2540]">{Math.min(rejectedPage * pageSize, report.claims.filter((c) => c.status === "REJECTED").length)}</span> of{" "}
                            <span className="font-semibold text-[#0A2540]">{report.claims.filter((c) => c.status === "REJECTED").length}</span> records
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setRejectedPage((p) => Math.max(1, p - 1))}
                              disabled={rejectedPage === 1}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-all"
                            >
                              Previous
                            </button>

                            {Array.from({ length: Math.ceil(report.claims.filter((c) => c.status === "REJECTED").length / pageSize) }, (_, i) => i + 1).map((pageNum) => (
                              <button
                                key={pageNum}
                                type="button"
                                onClick={() => setRejectedPage(pageNum)}
                                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                                  rejectedPage === pageNum
                                    ? "bg-blue-600 text-white shadow-xs"
                                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                {pageNum}
                              </button>
                            ))}

                            <button
                              type="button"
                              onClick={() => setRejectedPage((p) => Math.min(Math.ceil(report.claims.filter((c) => c.status === "REJECTED").length / pageSize), p + 1))}
                              disabled={rejectedPage === Math.ceil(report.claims.filter((c) => c.status === "REJECTED").length / pageSize)}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-all"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 3: Provider & Policy Summary */}
                {activeTab === "PROVIDERS" && (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Insurance Provider</TableHead>
                          <TableHead>Active Policies</TableHead>
                          <TableHead>Total Coverage Issued</TableHead>
                          <TableHead>Total Claims Filed</TableHead>
                          <TableHead>Total Amount Claimed</TableHead>
                          <TableHead>Total Approved Payout</TableHead>
                          <TableHead className="text-right">Utilization</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {!report.providerSummaries || report.providerSummaries.length === 0 ? (
                          <TableEmpty colSpan={7} message="No provider data available" />
                        ) : (
                          report.providerSummaries
                            .slice((providersPage - 1) * pageSize, providersPage * pageSize)
                            .map((p) => {
                              const util =
                                p.totalCoverage > 0 ? ((p.totalApproved / p.totalCoverage) * 100).toFixed(1) : "0.0";
                              return (
                                <TableRow key={p.providerName}>
                                  <TableCell className="font-bold text-[#0A2540]">{p.providerName}</TableCell>
                                  <TableCell className="font-semibold text-slate-700">{p.policyCount}</TableCell>
                                  <TableCell className="font-medium text-slate-700">
                                    Rs. {p.totalCoverage?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </TableCell>
                                  <TableCell className="font-semibold text-blue-600">{p.claimCount}</TableCell>
                                  <TableCell className="font-medium text-slate-700">
                                    Rs. {p.totalClaimed?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </TableCell>
                                  <TableCell className="font-bold text-emerald-600">
                                    Rs. {p.totalApproved?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                                      {util}%
                                    </span>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                        )}
                      </TableBody>
                    </Table>

                    {/* 6-Record Pagination for Tab 3 */}
                    {report.providerSummaries && report.providerSummaries.length > pageSize && (
                      <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-white rounded-b-2xl gap-3 text-xs text-slate-500">
                        <div>
                          Showing <span className="font-semibold text-[#0A2540]">{(providersPage - 1) * pageSize + 1}</span> to{" "}
                          <span className="font-semibold text-[#0A2540]">{Math.min(providersPage * pageSize, report.providerSummaries.length)}</span> of{" "}
                          <span className="font-semibold text-[#0A2540]">{report.providerSummaries.length}</span> providers
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setProvidersPage((p) => Math.max(1, p - 1))}
                            disabled={providersPage === 1}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-all"
                          >
                            Previous
                          </button>

                          {Array.from({ length: Math.ceil(report.providerSummaries.length / pageSize) }, (_, i) => i + 1).map((pageNum) => (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => setProvidersPage(pageNum)}
                              className={`w-8 h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                                providersPage === pageNum
                                  ? "bg-blue-600 text-white shadow-xs"
                                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          ))}

                          <button
                            type="button"
                            onClick={() => setProvidersPage((p) => Math.min(Math.ceil(report.providerSummaries.length / pageSize), p + 1))}
                            disabled={providersPage === Math.ceil(report.providerSummaries.length / pageSize)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-all"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
