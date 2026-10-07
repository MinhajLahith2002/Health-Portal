"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Download,
  DollarSign,
  ArrowUpRight,
  RefreshCw,
  ChevronRight,
  Lock,
} from "lucide-react";
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
import { InsuranceClaim, InsurancePolicy, ClaimStatus } from "@/types/insurance";
import { generatePatientStatementPdf } from "@/lib/insurancePdfGenerator";

const statusVariant: Record<ClaimStatus, "success" | "danger" | "warning" | "primary"> = {
  APPROVED: "success",
  PAID: "primary",
  SUBMITTED: "primary",
  UNDER_REVIEW: "warning",
  REJECTED: "danger",
};

export default function PatientInsurancePage() {
  const router = useRouter();
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("This year");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Notifications
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  const loadData = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const [policiesData, claimsData] = await Promise.all([
        insuranceService.getMyPolicies(),
        insuranceService.getMyClaims(),
      ]);
      setPolicies(policiesData);
      setClaims(claimsData);
      setErrorMessage(null);
    } catch {
      showError("Failed to load your insurance information.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      insuranceService.getMyPolicies(),
      insuranceService.getMyClaims(),
    ])
      .then(([policiesData, claimsData]) => {
        if (isMounted) {
          setPolicies(policiesData);
          setClaims(claimsData);
          setErrorMessage(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setErrorMessage("Failed to load your insurance information.");
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

  const activePolicy = useMemo(
    () => policies.find((p) => p.status === "ACTIVE") || policies[0] || null,
    [policies]
  );

  const remainingCoverage = useMemo(() => {
    if (!activePolicy) return 0;
    return Math.max(0, (activePolicy.coverageAmount || 0) - (activePolicy.coverageUsed || 0));
  }, [activePolicy]);

  const coveragePercent = useMemo(() => {
    if (!activePolicy || !activePolicy.coverageAmount) return 0;
    return Math.min(
      100,
      Math.round(((activePolicy.coverageUsed || 0) / activePolicy.coverageAmount) * 100)
    );
  }, [activePolicy]);

  // Live Metrics (from dynamic claim database records)
  const metrics = useMemo(() => {
    const totalFiled = claims.length;
    const approvedCount = claims.filter(
      (c) => c.status === "APPROVED" || c.status === "PAID"
    ).length;
    const pendingCount = claims.filter(
      (c) => c.status === "SUBMITTED" || c.status === "UNDER_REVIEW"
    ).length;
    const totalReimbursed = claims
      .filter((c) => c.status === "APPROVED" || c.status === "PAID")
      .reduce((sum, c) => sum + (c.approvedAmount || 0), 0);

    return {
      totalFiled,
      approvedCount,
      pendingCount,
      totalReimbursed,
    };
  }, [claims]);

  // Filtered Claims for table
  const filteredClaims = useMemo(() => {
    if (!searchQuery.trim()) return claims;
    const q = searchQuery.toLowerCase();
    return claims.filter(
      (c) =>
        c.claimNumber.toLowerCase().includes(q) ||
        (c.providerName && c.providerName.toLowerCase().includes(q)) ||
        (c.treatmentDescription && c.treatmentDescription.toLowerCase().includes(q))
    );
  }, [claims, searchQuery]);

  // Paginated Claims (6 per page)
  const totalPages = Math.ceil(filteredClaims.length / pageSize) || 1;
  const paginatedClaims = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredClaims.slice(start, start + pageSize);
  }, [filteredClaims, currentPage, pageSize]);

  // Export Statement as PDF
  const handleExportStatement = () => {
    try {
      const pdfBlob = generatePatientStatementPdf(activePolicy, claims, metrics);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Insurance_Statement_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showSuccess("Insurance statement downloaded as PDF.");
    } catch {
      showError("Failed to generate insurance statement PDF.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A2540] tracking-tight">
            Insurance
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your coverage, claims, and medical bills.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
            onClick={() => loadData(true)}
            className="text-slate-600 whitespace-nowrap"
          >
            Refresh
          </Button>
          <Button
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => router.push("/patient/insurance/submit-claim")}
            className="shadow-sm whitespace-nowrap"
          >
            Submit New Claim
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

      {/* Top 4 Live Metric Cards (Instant Render) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Claims Filed"
          value={loading ? "—" : metrics.totalFiled.toString()}
          subtitle={loading ? "Fetching data..." : "Submitted by you"}
          icon={<FileText className="w-5 h-5 text-blue-600" />}
        />
        <StatCard
          title="Claims Approved"
          value={loading ? "—" : metrics.approvedCount.toString()}
          subtitle={loading ? "Fetching data..." : "Paid to you"}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          title="Pending Claims"
          value={loading ? "—" : metrics.pendingCount.toString()}
          subtitle={loading ? "Checking status..." : "Being reviewed"}
          icon={<Clock className="w-5 h-5 text-amber-600" />}
        />
        <StatCard
          title="Amount Reimbursed"
          value={loading ? "—" : `Rs. ${metrics.totalReimbursed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={loading ? "Calculating..." : "Total paid back"}
          icon={<DollarSign className="w-5 h-5 text-indigo-600" />}
        />
      </div>

      {/* Full-Width: My Coverage Card */}
          {/* My Coverage Card (Matching Figma Design) */}
          <Card className="p-6 bg-white shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-base font-bold text-[#0A2540]">My Coverage</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  View your plan details, deductible status, and out-of-pocket max.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  onClick={handleExportStatement}
                  className="text-xs whitespace-nowrap"
                >
                  Export PDF
                </Button>
                <Button
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => router.push("/patient/insurance/submit-claim")}
                  className="text-xs shadow-xs whitespace-nowrap"
                >
                  New Claim
                </Button>
              </div>
            </div>

            {/* 3 Mini Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Plan Status
                </span>
                <p className="text-sm font-extrabold text-emerald-600">
                  {loading ? "Checking..." : activePolicy ? activePolicy.status : "No Active Plan"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {loading
                    ? "Loading policy..."
                    : activePolicy?.endDate
                    ? `Active until ${new Date(activePolicy.endDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}`
                    : "No expiration set"}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Coverage Used
                </span>
                <p className="text-sm font-extrabold text-slate-900">
                  {loading ? "—" : `Rs. ${(activePolicy?.coverageUsed || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </p>
                <p className="text-[11px] text-slate-500">
                  {loading ? "Loading..." : `of Rs. ${(activePolicy?.coverageAmount || 0).toLocaleString()} annual limit`}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Remaining Balance
                </span>
                <p className="text-sm font-extrabold text-blue-600">
                  {loading ? "—" : `Rs. ${remainingCoverage.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </p>
                <p className="text-[11px] text-slate-500">Remaining this year</p>
              </div>
            </div>

            {/* Progress Bar */}
            {activePolicy && (
              <div className="mt-4 pt-2 space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Coverage Pool Utilization</span>
                  <span className="font-bold text-slate-700">{coveragePercent}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      coveragePercent > 80
                        ? "bg-red-500"
                        : coveragePercent > 50
                        ? "bg-amber-500"
                        : "bg-blue-600"
                    }`}
                    style={{ width: `${coveragePercent}%` }}
                  />
                </div>
              </div>
            )}
          </Card>

          {/* My Claims Table Card (Matching Figma Design) */}
          <Card className="shadow-xs">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold text-[#0A2540]">
                    My Claims
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Track your claims and see what&apos;s next.
                  </p>
                </div>

                {/* Search Box */}
                <div className="relative max-w-xs w-full">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search claims..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={7} className="h-44 text-center">
                        <div className="flex items-center justify-center py-8">
                          <Loader />
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : filteredClaims.length === 0 ? (
                <Table>
                  <TableBody>
                    <TableEmpty
                      colSpan={7}
                      message="No claims found"
                      description={
                        searchQuery
                          ? "No claims match your search query."
                          : "You have not submitted any insurance claims yet."
                      }
                    />
                  </TableBody>
                </Table>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Claim #</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedClaims.map((c) => (
                      <TableRow key={c.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Claim # */}
                        <TableCell>
                          <Link
                            href={`/patient/insurance/claims/${c.id}`}
                            className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-500" />
                            <span>{c.claimNumber}</span>
                          </Link>
                        </TableCell>

                        {/* Provider */}
                        <TableCell className="text-xs font-semibold text-slate-800">
                          {c.providerName || activePolicy?.providerName || "Ceylinco Life"}
                        </TableCell>

                        {/* Service */}
                        <TableCell className="text-xs text-slate-600 max-w-[140px] truncate">
                          {c.treatmentDescription || "Medical Service"}
                        </TableCell>

                        {/* Date */}
                        <TableCell className="text-xs text-slate-500">
                          {c.submittedAt
                            ? new Date(c.submittedAt).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </TableCell>

                        {/* Amount */}
                        <TableCell className="text-xs font-bold text-slate-900">
                          Rs. {c.claimAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge variant={statusVariant[c.status]}>
                            {c.status === "UNDER_REVIEW" ? "In Review" : c.status}
                          </Badge>
                        </TableCell>

                        {/* Actions (Centered: View and Track buttons) */}
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                              onClick={() => router.push(`/patient/insurance/claims/${c.id}`)}
                              className="h-7 text-xs px-2.5 min-w-[76px] whitespace-nowrap"
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => router.push(`/patient/insurance/claims/${c.id}`)}
                              className="h-7 text-xs px-3 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Track
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Pagination Controls (Matching Screenshot 2) */}
              {filteredClaims.length > 0 && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-white rounded-b-2xl gap-3 text-xs text-slate-500">
                  <div>
                    Showing <span className="font-semibold text-[#0A2540]">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                    <span className="font-semibold text-[#0A2540]">{Math.min(currentPage * pageSize, filteredClaims.length)}</span> of{" "}
                    <span className="font-semibold text-[#0A2540]">{filteredClaims.length}</span> claims
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

      {/* Balanced Bottom 2-Column Grid (50% / 50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Billing Summary & Activity History */}
        <div className="space-y-6">
          {/* Billing Summary Card */}
          <Card className="p-5 bg-white shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#0A2540]">Billing Summary</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                View statements and payment history.
              </p>
            </div>

            <div className="space-y-3">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="This year">This year</option>
                <option value="2025">2025</option>
                <option value="All Time">All Time</option>
              </select>

              <Button
                onClick={handleExportStatement}
                className="w-full text-xs font-semibold py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
              >
                Download Statement (PDF)
              </Button>
            </div>
          </Card>

          {/* Activity History Card */}
          <Card className="p-5 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#0A2540]">Activity History</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  What happened with your claims.
                </p>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                <Lock className="w-3 h-3" />
                <span>Claims Protected</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              {loading ? (
                <div className="p-4 rounded-xl bg-slate-50 text-slate-400 text-center text-xs">
                  Loading activity...
                </div>
              ) : claims.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 text-slate-400 text-center text-xs">
                  No recent claim activity yet.
                </div>
              ) : (
                claims.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-800">
                        {c.status === "APPROVED"
                          ? `Claim ${c.claimNumber} was approved`
                          : c.status === "REJECTED"
                          ? `Claim ${c.claimNumber} was declined`
                          : `You submitted claim ${c.claimNumber}`}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Status:{" "}
                        <span
                          className={`font-semibold ${
                            c.status === "APPROVED" || c.status === "PAID"
                              ? "text-emerald-600"
                              : c.status === "REJECTED"
                              ? "text-rose-600"
                              : "text-amber-600"
                          }`}
                        >
                          {c.status}
                        </span>
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {c.submittedAt
                        ? new Date(c.submittedAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                          })
                        : "Recent"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Claim Help & FAQs */}
        <div className="space-y-6">
          {/* Claim Help Card */}
          <Card className="p-5 bg-white shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#0A2540]">Claim Help</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Submit a claim, upload documents, and contact support.
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 hover:bg-slate-100/80 transition-colors">
                <div>
                  <p className="font-bold text-slate-800">Submit New Claim</p>
                  <p className="text-[11px] text-slate-400">Upload a bill and submit for reimbursement</p>
                </div>
                <Button
                  size="sm"
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                  onClick={() => router.push("/patient/insurance/submit-claim")}
                  className="h-7 text-xs px-2.5 whitespace-nowrap"
                >
                  Start claim
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <div>
                  <p className="font-bold text-slate-800">Upload Documents</p>
                  <p className="text-[11px] text-slate-400">Add receipts and medical bills</p>
                </div>
                <div className="w-8 h-4 rounded-full bg-blue-600 relative cursor-pointer">
                  <div className="w-3.5 h-3.5 rounded-full bg-white absolute right-0.5 top-0.5" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <div>
                  <p className="font-bold text-slate-800">Contact Support</p>
                  <p className="text-[11px] text-slate-400">Message support or call for help</p>
                </div>
                <div className="w-8 h-4 rounded-full bg-blue-600 relative cursor-pointer">
                  <div className="w-3.5 h-3.5 rounded-full bg-white absolute right-0.5 top-0.5" />
                </div>
              </div>
            </div>
          </Card>

          {/* FAQs Card (Matching Figma Design) */}
          <Card className="p-5 bg-white shadow-xs space-y-3">
            <div>
              <h2 className="text-sm font-bold text-[#0A2540]">FAQs</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Quick answers about claims and billing.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <details className="group p-2.5 rounded-xl border border-slate-200/70 bg-slate-50/50 open:bg-blue-50/40">
                <summary className="font-semibold text-slate-800 cursor-pointer list-none flex justify-between items-center">
                  <span>How claims work</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                  Submit your hospital bills and prescriptions. An insurance officer verifies coverage and issues payment directly to your account.
                </p>
              </details>

              <details className="group p-2.5 rounded-xl border border-slate-200/70 bg-slate-50/50 open:bg-blue-50/40">
                <summary className="font-semibold text-slate-800 cursor-pointer list-none flex justify-between items-center">
                  <span>What to upload</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                  Upload itemized invoices, payment receipts, diagnostic lab reports, and doctor referrals in PDF or image format.
                </p>
              </details>

              <details className="group p-2.5 rounded-xl border border-slate-200/70 bg-slate-50/50 open:bg-blue-50/40">
                <summary className="font-semibold text-slate-800 cursor-pointer list-none flex justify-between items-center">
                  <span>Payment timeline</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                  Most claims are adjudicated within 24 to 48 hours of submission.
                </p>
              </details>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}