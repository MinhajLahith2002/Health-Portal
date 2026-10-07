"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Building2,
  User,
  Calendar,
  DollarSign,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
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
import ClaimDecisionModal from "./ClaimDecisionModal";

const statusVariant: Record<ClaimStatus, "success" | "danger" | "warning" | "primary"> = {
  APPROVED: "success",
  PAID: "primary",
  SUBMITTED: "primary",
  UNDER_REVIEW: "warning",
  REJECTED: "danger",
};

export default function ClaimsListPage() {
  const router = useRouter();

  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter, and Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [providerFilter, setProviderFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Decision Modal State
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null);
  const [decisionMode, setDecisionMode] = useState<"APPROVE" | "REJECT" | "REVIEW">("REVIEW");

  // Feedback notifications
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

  const loadClaims = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const data = await insuranceService.getAllClaims();
      setClaims(data);
      setErrorMessage(null);
    } catch {
      showError("Failed to load claims from server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    insuranceService
      .getAllClaims()
      .then((data) => {
        if (isMounted) {
          setClaims(data);
          setErrorMessage(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setErrorMessage("Failed to load claims from server.");
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

  // Unique providers from claims
  const uniqueProviders = useMemo(() => {
    const set = new Set<string>();
    claims.forEach((c) => {
      if (c.providerName) set.add(c.providerName);
    });
    return Array.from(set).sort();
  }, [claims]);

  // Filtered claims
  const filteredClaims = useMemo(() => {
    return claims.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        c.claimNumber.toLowerCase().includes(q) ||
        c.patientId.toLowerCase().includes(q) ||
        (c.treatmentDescription && c.treatmentDescription.toLowerCase().includes(q)) ||
        (c.providerName && c.providerName.toLowerCase().includes(q)) ||
        (c.policyNumber && c.policyNumber.toLowerCase().includes(q));

      let matchesStatus = true;
      if (statusFilter === "PENDING") {
        matchesStatus = c.status === "SUBMITTED" || c.status === "UNDER_REVIEW";
      } else if (statusFilter !== "ALL") {
        matchesStatus = c.status === statusFilter;
      }

      const matchesProvider =
        providerFilter === "ALL" || c.providerName === providerFilter;

      return matchesSearch && matchesStatus && matchesProvider;
    });
  }, [claims, searchQuery, statusFilter, providerFilter]);

  // Paginated claims
  const totalPages = Math.ceil(filteredClaims.length / pageSize) || 1;
  const paginatedClaims = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredClaims.slice(start, start + pageSize);
  }, [filteredClaims, currentPage, pageSize]);

  // Live Metrics
  const metrics = useMemo(() => {
    const total = claims.length;
    const pending = claims.filter(
      (c) => c.status === "SUBMITTED" || c.status === "UNDER_REVIEW"
    ).length;
    const approved = claims.filter((c) => c.status === "APPROVED" || c.status === "PAID").length;
    const rejected = claims.filter((c) => c.status === "REJECTED").length;
    const totalApprovedPayout = claims
      .filter((c) => c.status === "APPROVED" || c.status === "PAID")
      .reduce((acc, c) => acc + (c.approvedAmount || 0), 0);
    const rejectionRate = total > 0 ? ((rejected / total) * 100).toFixed(1) : "0.0";

    return {
      total,
      pending,
      approved,
      rejected,
      totalApprovedPayout,
      rejectionRate,
    };
  }, [claims]);

  const openDecisionModal = (claim: InsuranceClaim, mode: "APPROVE" | "REJECT" | "REVIEW") => {
    setSelectedClaim(claim);
    setDecisionMode(mode);
  };

  const handleDecisionComplete = () => {
    setSelectedClaim(null);
    showSuccess("Claim decision saved successfully.");
    loadClaims();
  };

  return (
    <DashboardLayout pageTitle="Insurance Claims" userRole="INSURANCE_OFFICER">
      <div className="space-y-6">
        {/* Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
              <span>Insurance</span>
              <span>/</span>
              <span className="text-slate-400">Claims</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A2540] tracking-tight">
              Insurance Claims
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Search, filter, and manage insurance claims submitted for adjudication.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
              onClick={() => loadClaims(true)}
              className="text-slate-600 whitespace-nowrap"
            >
              Refresh
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

        {/* Live Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Claims"
            value={metrics.total.toString()}
            subtitle="All claims in system"
            icon={<FileText className="w-5 h-5 text-blue-600" />}
          />
          <StatCard
            title="Pending Review"
            value={metrics.pending.toString()}
            subtitle="Requires officer adjudication"
            icon={<Clock className="w-5 h-5 text-amber-600" />}
          />
          <StatCard
            title="Approved Payouts"
            value={`Rs. ${metrics.totalApprovedPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            subtitle={`${metrics.approved} claims settled`}
            icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
          />
          <StatCard
            title="Rejection Rate"
            value={`${metrics.rejectionRate}%`}
            subtitle={`${metrics.rejected} claims rejected`}
            icon={<XCircle className="w-5 h-5 text-rose-600" />}
          />
        </div>

        {/* Search & Filter Controls (Figma Design Pattern) */}
        <Card className="p-4 bg-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search claims by ID, patient, provider, treatment..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter Chips */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                {[
                  { id: "ALL", label: "All" },
                  { id: "PENDING", label: "Pending" },
                  { id: "APPROVED", label: "Approved" },
                  { id: "REJECTED", label: "Rejected" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setStatusFilter(s.id);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      statusFilter === s.id
                        ? "bg-white text-blue-600 shadow-sm font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Provider Dropdown */}
              {uniqueProviders.length > 0 && (
                <select
                  value={providerFilter}
                  onChange={(e) => {
                    setProviderFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Providers</option>
                  {uniqueProviders.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </Card>

        {/* Claims Table (Matching Figma Design) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-[#0A2540]">
                Insurance Claims Directory
              </CardTitle>
              <Badge variant="primary" className="text-xs">
                {filteredClaims.length} {filteredClaims.length === 1 ? "Claim" : "Claims"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader />
              </div>
            ) : filteredClaims.length === 0 ? (
              <Table>
                <TableBody>
                  <TableEmpty
                    colSpan={7}
                    message="No claims found"
                    description={
                      searchQuery || statusFilter !== "ALL" || providerFilter !== "ALL"
                        ? "No claims match the specified filter criteria."
                        : "No insurance claims are currently recorded in the database."
                    }
                  />
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim ID</TableHead>
                    <TableHead>Patient Name / ID</TableHead>
                    <TableHead>Insurance Provider</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedClaims.map((c) => {
                    const isPending = c.status === "SUBMITTED" || c.status === "UNDER_REVIEW";

                    return (
                      <TableRow key={c.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Claim ID */}
                        <TableCell>
                          <Link
                            href={`/insurance-officer/claims/${c.id}`}
                            className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 group"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-500 group-hover:scale-110 transition-transform" />
                            <span>{c.claimNumber}</span>
                          </Link>
                        </TableCell>

                        {/* Patient */}
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-slate-700">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-mono font-medium">{c.patientId}</span>
                          </div>
                        </TableCell>

                        {/* Provider & Policy */}
                        <TableCell>
                          <div className="space-y-0.5 text-xs">
                            <div className="flex items-center gap-1 font-semibold text-slate-900">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span>{c.providerName || "Standard Provider"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                              {c.policyNumber && <span>#{c.policyNumber}</span>}
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-sans font-medium">
                                {c.branch || "Colombo"} Branch
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Date */}
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>
                              {c.submittedAt
                                ? new Date(c.submittedAt).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "—"}
                            </span>
                          </div>
                        </TableCell>

                        {/* Amount */}
                        <TableCell>
                          <div className="space-y-0.5 text-xs">
                            <span className="font-bold text-slate-900">
                              Rs. {c.claimAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            {c.approvedAmount != null && (c.status === "APPROVED" || c.status === "PAID") && (
                              <p className="text-[10px] font-semibold text-emerald-600">
                                Approved: Rs. {Number(c.approvedAmount).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge variant={statusVariant[c.status]}>{c.status}</Badge>
                        </TableCell>

                        {/* Actions (Centered: View + Approve/Reject if pending, arranged vertically) */}
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                            <Button
                              size="sm"
                              variant="outline"
                              rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                              onClick={() => router.push(`/insurance-officer/claims/${c.id}`)}
                              className="h-7 text-xs px-2.5 min-w-[76px] w-full max-w-[80px] whitespace-nowrap"
                            >
                              View
                            </Button>

                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openDecisionModal(c, "APPROVE")}
                                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors h-7 min-w-[76px] w-full max-w-[80px] inline-flex items-center justify-center"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openDecisionModal(c, "REJECT")}
                                  className="px-3 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold transition-colors h-7 min-w-[76px] w-full max-w-[80px] inline-flex items-center justify-center"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

            {/* Pagination Controls (Matching Screenshot 2) */}
            {filteredClaims.length > 0 && totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-white rounded-b-2xl gap-3 text-xs text-slate-500">
                <div>
                  Showing{" "}
                  <span className="font-semibold text-[#0A2540]">
                    {(currentPage - 1) * pageSize + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-[#0A2540]">
                    {Math.min(currentPage * pageSize, filteredClaims.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-[#0A2540]">
                    {filteredClaims.length}
                  </span>{" "}
                  claims
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

        {/* Adjudication Decision Modal */}
        {selectedClaim && (
          <ClaimDecisionModal
            claim={selectedClaim}
            initialMode={decisionMode}
            onClose={() => setSelectedClaim(null)}
            onDecided={handleDecisionComplete}
          />
        )}
      </div>
    </DashboardLayout>
  );
}