"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  PlusCircle,
  FileCheck2,
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
import Loader from "@/components/ui/Loader";
import { insuranceService } from "@/services/insuranceService";
import { InsuranceClaim, ClaimStatus } from "@/types/insurance";
import ClaimDecisionModal from "../claims/ClaimDecisionModal";

const statusVariant: Record<ClaimStatus, "success" | "danger" | "warning" | "primary"> = {
  APPROVED: "success",
  PAID: "primary",
  SUBMITTED: "primary",
  UNDER_REVIEW: "warning",
  REJECTED: "danger",
};

export default function InsuranceOfficerDashboard() {
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeClaim, setActiveClaim] = useState<InsuranceClaim | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const loadData = useCallback(() => {
    setLoading(true);
    insuranceService
      .getAllClaims()
      .then((data) => {
        setClaims(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch(() => setError("Failed to load claims data from server"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let isMounted = true;
    insuranceService
      .getAllClaims()
      .then((data) => {
        if (isMounted) {
          setClaims(Array.isArray(data) ? data : []);
          setError(null);
        }
      })
      .catch(() => {
        if (isMounted) setError("Failed to load claims data from server");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const safeClaims = useMemo(() => (Array.isArray(claims) ? claims : []), [claims]);

  // Metrics Calculations
  const totalClaimsCount = safeClaims.length;
  const approvedCount = safeClaims.filter((c) => c.status === "APPROVED" || c.status === "PAID").length;
  const pendingCount = safeClaims.filter((c) => c.status === "SUBMITTED" || c.status === "UNDER_REVIEW").length;
  const rejectedCount = safeClaims.filter((c) => c.status === "REJECTED").length;

  const approvalRate = totalClaimsCount > 0 ? Math.round((approvedCount / totalClaimsCount) * 100) : 0;

  // Pending claims queue with 6 items per page
  const allPendingClaims = useMemo(
    () =>
      safeClaims
        .filter((c) => c.status === "SUBMITTED" || c.status === "UNDER_REVIEW")
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()),
    [safeClaims]
  );

  const totalPages = Math.ceil(allPendingClaims.length / pageSize) || 1;

  const paginatedPendingClaims = useMemo(
    () => allPendingClaims.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [allPendingClaims, currentPage]
  );

  // Status Split Data for Donut Chart (Strictly dynamic from database)
  const statusSplitData = useMemo(() => {
    const data = [
      { name: "Approved", value: approvedCount, color: "#10B981" },
      { name: "Pending Review", value: pendingCount, color: "#F59E0B" },
      { name: "Flagged / Rejected", value: rejectedCount, color: "#EF4444" },
    ];
    return data.filter((d) => d.value > 0);
  }, [approvedCount, pendingCount, rejectedCount]);

  // 100% Dynamic 6-Month Trend generated from actual claim submittedAt timestamps
  const monthlyTrendData = useMemo(() => {
    const now = new Date();
    const months: { month: string; year: number; monthIndex: number; volume: number; payout: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthShort = d.toLocaleString("default", { month: "short" });
      months.push({
        month: monthShort,
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
        volume: 0,
        payout: 0,
      });
    }

    safeClaims.forEach((claim) => {
      if (!claim.submittedAt) return;
      const claimDate = new Date(claim.submittedAt);
      if (isNaN(claimDate.getTime())) return;

      const target = months.find(
        (m) => m.monthIndex === claimDate.getMonth() && m.year === claimDate.getFullYear()
      );

      if (target) {
        target.volume += 1;
        if (claim.status === "APPROVED" || claim.status === "PAID") {
          target.payout += (claim.approvedAmount || claim.claimAmount || 0) / 1000; // In $k
        }
      }
    });

    return months.map(({ month, volume, payout }) => ({
      month,
      volume,
      payout: Number(payout.toFixed(2)),
    }));
  }, [safeClaims]);

  return (
    <DashboardLayout pageTitle="Insurance" userRole="INSURANCE_OFFICER">
      <div className="space-y-6">
        {/* Top Header & Context Description */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
              <span>Insurance</span>
              <span>/</span>
              <span className="text-slate-400">Claims Overview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A2540] tracking-tight">
              Insurance Checking
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage claims, approvals, fraud detection and reporting.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/insurance-officer/policies/new">
              <Button
                size="sm"
                variant="outline"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                className="whitespace-nowrap"
              >
                New Policy
              </Button>
            </Link>
            <Link href="/insurance-officer/claims">
              <Button
                size="sm"
                leftIcon={<FileCheck2 className="w-4 h-4" />}
                className="whitespace-nowrap"
              >
                All Claims
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={loadData}>
              Retry
            </Button>
          </div>
        )}

        {/* Stat Cards Grid (Instant Render with Live DB Data) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Claims"
            value={loading ? "—" : totalClaimsCount.toLocaleString()}
            icon={<FileText className="w-5 h-5 text-blue-600" />}
            iconBgColor="bg-blue-50"
            subtitle={loading ? "Fetching data..." : `${safeClaims.length} recorded`}
          />

          <StatCard
            title="Approved"
            value={loading ? "—" : approvedCount.toLocaleString()}
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            iconBgColor="bg-emerald-50"
            trend={{
              value: `${approvalRate}%`,
              isPositive: approvalRate >= 50,
              label: "approval rate",
            }}
          />

          <StatCard
            title="Pending Review"
            value={loading ? "—" : pendingCount.toLocaleString()}
            icon={<Clock className="w-5 h-5 text-amber-600" />}
            iconBgColor="bg-amber-50"
            subtitle={loading ? "Checking queue..." : pendingCount > 0 ? "Awaiting action" : "No pending claims"}
          />

          <StatCard
            title="Flagged / Rejected"
            value={loading ? "—" : rejectedCount.toLocaleString()}
            icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
            iconBgColor="bg-red-50"
            subtitle={loading ? "Checking status..." : rejectedCount > 0 ? "Needs attention" : "Zero rejected claims"}
          />
        </div>

        {/* Visual Analytics Charts (Figma 2-Column Section) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Chart: Claims Volume & Payouts */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-bold text-[#0A2540]">
                  Claims Volume & Payouts
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Last 6 months trend</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-slate-600">Volume</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span className="text-slate-600">Payout (Rs. &apos;000)</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              {loading ? (
                <div className="h-64 w-full flex items-center justify-center">
                  <Loader />
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorPayout" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
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
                        dataKey="volume"
                        name="Claims Volume"
                        stroke="#3B82F6"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorVolume)"
                      />
                      <Area
                        type="monotone"
                        dataKey="payout"
                        name="Payout (Rs. '000)"
                        stroke="#06B6D4"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorPayout)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Chart: Claim Status Split */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-[#0A2540]">
                Claim Status Split
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Current distribution</p>
            </CardHeader>

            <CardContent className="pt-2">
              {loading ? (
                <div className="h-56 w-full flex items-center justify-center">
                  <Loader />
                </div>
              ) : totalClaimsCount === 0 ? (
                <div className="h-56 w-full flex flex-col items-center justify-center text-center p-4">
                  <div className="w-16 h-16 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center mb-3">
                    <Clock className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">No Claims Recorded</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[180px]">
                    Status distribution chart will appear once claims are submitted.
                  </p>
                </div>
              ) : (
                <>
                  <div className="h-56 w-full relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusSplitData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {statusSplitData.map((entry, index) => (
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

                  {/* Status Breakdown Legend */}
                  <div className="mt-2 space-y-2 text-xs">
                    {statusSplitData.map((item) => (
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

        {/* Priority Pending Claims Review Queue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-base font-bold text-[#0A2540]">
                Pending Claims Awaiting Review
              </CardTitle>
              {pendingCount > 0 && (
                <Badge variant="warning" size="sm">
                  {pendingCount} Pending
                </Badge>
              )}
            </div>

            <Link
              href="/insurance-officer/claims"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 hover:underline"
            >
              View all claims <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim ID</TableHead>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Treatment / Diagnosis</TableHead>
                  <TableHead>Claim Amount</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-44 text-center">
                      <div className="flex items-center justify-center py-8">
                        <Loader />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedPendingClaims.length === 0 ? (
                  <TableEmpty
                    colSpan={7}
                    message={
                      totalClaimsCount === 0
                        ? "No pending claims found. Claims submitted by patients will appear here for review."
                        : "All claims are up to date. No pending claims awaiting decision."
                    }
                  />
                ) : (
                  paginatedPendingClaims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-semibold text-blue-600">
                        {claim.claimNumber}
                      </TableCell>
                      <TableCell className="text-slate-600 font-medium">
                        {claim.patientId}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-slate-700">
                        {claim.treatmentDescription || "General Medical Treatment"}
                      </TableCell>
                      <TableCell className="font-bold text-[#0A2540]">
                        Rs. {claim.claimAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs">
                        {claim.submittedAt ? new Date(claim.submittedAt).toLocaleDateString() : "Recent"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[claim.status]}>{claim.status}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                          <Link href={`/insurance-officer/claims/${claim.id}`} className="w-full max-w-[80px]">
                            <Button
                              size="sm"
                              variant="outline"
                              rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                              className="h-7 text-xs px-2.5 min-w-[76px] w-full whitespace-nowrap"
                            >
                              View
                            </Button>
                          </Link>
                          <Button size="sm" onClick={() => setActiveClaim(claim)} className="h-7 text-xs px-3 min-w-[76px] w-full max-w-[80px]">
                            Review
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* 6-Record Pagination Controls matching Screenshot 2 */}
            {allPendingClaims.length > 0 && totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-white rounded-b-2xl gap-3 text-xs text-slate-500">
                <div>
                  Showing <span className="font-semibold text-[#0A2540]">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                  <span className="font-semibold text-[#0A2540]">{Math.min(currentPage * pageSize, allPendingClaims.length)}</span> of{" "}
                  <span className="font-semibold text-[#0A2540]">{allPendingClaims.length}</span> pending claims
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-all"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white shadow-xs"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Tools & Shortcuts Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/insurance-officer/policies"
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#0A2540]">Policy Directory</h4>
              <p className="text-xs text-slate-500 mt-0.5">Search and verify active coverage</p>
            </div>
          </Link>

          <Link
            href="/fraud-detection/alerts"
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#0A2540]">Fraud Intelligence</h4>
              <p className="text-xs text-slate-500 mt-0.5">Review high-risk flagged claims</p>
            </div>
          </Link>

          <Link
            href="/insurance-officer/reports"
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#0A2540]">Claims & Payout Reports</h4>
              <p className="text-xs text-slate-500 mt-0.5">Generate exportable summaries</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Decision Review Modal */}
      {activeClaim && (
        <ClaimDecisionModal
          claim={activeClaim}
          onClose={() => setActiveClaim(null)}
          onDecided={() => {
            setActiveClaim(null);
            loadData();
          }}
        />
      )}
    </DashboardLayout>
  );
}