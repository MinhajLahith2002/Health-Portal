"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  ShieldCheck,
  ArrowLeft,
  Calendar,
  Building2,
  DollarSign,
  User,
  FileText,
  Printer,
  PauseCircle,
  PlayCircle,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
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
import { InsurancePolicy, InsuranceClaim, PolicyStatus, ClaimStatus } from "@/types/insurance";

const statusVariant: Record<PolicyStatus, "success" | "danger" | "warning" | "neutral"> = {
  ACTIVE: "success",
  EXPIRED: "neutral",
  CANCELLED: "danger",
  SUSPENDED: "warning",
};

const claimStatusVariant: Record<ClaimStatus, "success" | "danger" | "warning" | "primary"> = {
  APPROVED: "success",
  PAID: "primary",
  SUBMITTED: "primary",
  UNDER_REVIEW: "warning",
  REJECTED: "danger",
};

export default function PolicyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [policy, setPolicy] = useState<InsurancePolicy | null>(null);
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Self-contained notifications
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

  useEffect(() => {
    let isMounted = true;
    if (!id) return;
    Promise.all([
      insuranceService.getPolicyById(id),
      insuranceService.getClaimsByPolicyId(id).catch(() => []),
    ])
      .then(([policyData, claimsData]) => {
        if (isMounted) {
          setPolicy(policyData);
          setClaims(claimsData);
          setErrorMessage(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setErrorMessage("Failed to load policy details from server.");
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
  }, [id]);

  const handleStatusChange = async (newStatus: PolicyStatus) => {
    if (!policy) return;
    setUpdating(true);
    try {
      const updated = await insuranceService.updatePolicyStatus(policy.id, newStatus);
      setPolicy(updated);
      showSuccess(`Policy status successfully updated to ${newStatus}`);
    } catch {
      showError(`Failed to update policy status to ${newStatus}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Policy Details" userRole="INSURANCE_OFFICER">
        <div className="p-16 flex justify-center items-center">
          <Loader />
        </div>
      </DashboardLayout>
    );
  }

  if (!policy) {
    return (
      <DashboardLayout pageTitle="Policy Not Found" userRole="INSURANCE_OFFICER">
        <div className="text-center py-16 space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Policy Not Found</h2>
          <p className="text-sm text-slate-500">The requested insurance policy could not be retrieved.</p>
          <Button onClick={() => router.push("/insurance-officer/policies")}>
            Return to Policy Directory
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const usedPercent =
    policy.coverageAmount > 0
      ? Math.min(100, Math.round(((policy.coverageUsed || 0) / policy.coverageAmount) * 100))
      : 0;

  const remaining = Math.max(0, (policy.coverageAmount || 0) - (policy.coverageUsed || 0));
  const isExpired = new Date(policy.endDate) < new Date();

  const totalClaimsApprovedAmount = claims
    .filter((c) => c.status === "APPROVED" || c.status === "PAID")
    .reduce((acc, c) => acc + (c.approvedAmount || 0), 0);

  return (
    <DashboardLayout pageTitle={`Policy ${policy.policyNumber}`} userRole="INSURANCE_OFFICER">
      <div className="space-y-6">
        {/* Navigation & Header Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Link
                href="/insurance-officer/policies"
                className="hover:text-blue-600 flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Policy Directory</span>
              </Link>
              <span>/</span>
              <span className="text-blue-600 uppercase font-mono">{policy.policyNumber}</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A2540] tracking-tight">
                Policy {policy.policyNumber}
              </h1>
              <Badge variant={statusVariant[policy.status]} className="text-xs">
                {policy.status}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Underwritten by <strong className="text-slate-700">{policy.providerName}</strong> for beneficiary{" "}
              <strong className="text-slate-700">{policy.patientId}</strong>.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={() => window.print()}
              className="text-slate-600 whitespace-nowrap"
            >
              Print Summary
            </Button>

            {/* Status Transition Actions */}
            {policy.status === "ACTIVE" && (
              <Button
                size="sm"
                variant="outline"
                isLoading={updating}
                leftIcon={<PauseCircle className="w-4 h-4" />}
                onClick={() => handleStatusChange("SUSPENDED")}
                className="text-amber-700 hover:bg-amber-50 border-amber-200 whitespace-nowrap"
              >
                Suspend Policy
              </Button>
            )}

            {policy.status === "SUSPENDED" && (
              <Button
                size="sm"
                isLoading={updating}
                leftIcon={<PlayCircle className="w-4 h-4" />}
                onClick={() => handleStatusChange("ACTIVE")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white whitespace-nowrap"
              >
                Reactivate Policy
              </Button>
            )}

            {(policy.status === "ACTIVE" || policy.status === "SUSPENDED") && (
              <Button
                size="sm"
                variant="outline"
                isLoading={updating}
                leftIcon={<XCircle className="w-4 h-4" />}
                onClick={() => handleStatusChange("CANCELLED")}
                className="text-rose-700 hover:bg-rose-50 border-rose-200 whitespace-nowrap"
              >
                Cancel Policy
              </Button>
            )}
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

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Coverage Limit"
            value={`Rs. ${policy.coverageAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            subtitle="Maximum underwritten limit"
            icon={<Shield className="w-5 h-5 text-blue-600" />}
          />
          <StatCard
            title="Coverage Utilized"
            value={`Rs. ${(policy.coverageUsed || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            subtitle={`${usedPercent}% of total limit consumed`}
            icon={<DollarSign className="w-5 h-5 text-amber-600" />}
          />
          <StatCard
            title="Remaining Balance"
            value={`Rs. ${remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            subtitle={remaining <= 0 ? "Coverage pool exhausted" : "Available for claims"}
            icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}
          />
        </div>

        {/* Coverage Utilization Progress Bar Card */}
        <Card className="p-5 bg-white">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-[#0A2540]">Coverage Utilization Status</span>
              <span
                className={`font-extrabold ${
                  usedPercent > 80
                    ? "text-red-600"
                    : usedPercent > 50
                    ? "text-amber-600"
                    : "text-emerald-600"
                }`}
              >
                {usedPercent}% Utilized
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usedPercent > 80
                    ? "bg-red-500"
                    : usedPercent > 50
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${usedPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
              <span>Rs. 0.00</span>
              <span>
                Remaining: <strong>Rs. {remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
              </span>
              <span>Rs. {policy.coverageAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </Card>

        {/* Policy Metadata & Details Card */}
        <Card>
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base font-bold text-[#0A2540] flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Policy Contract Specifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-1">
                <span className="text-xs uppercase font-semibold text-slate-400">Policy Number</span>
                <p className="font-mono font-bold text-slate-800">{policy.policyNumber}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs uppercase font-semibold text-slate-400">Patient / Beneficiary</span>
                <div className="flex items-center gap-1.5 font-medium text-slate-800">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="font-mono">{policy.patientId}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs uppercase font-semibold text-slate-400">Insurance Provider</span>
                <div className="flex items-center gap-1.5 font-medium text-slate-800">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>{policy.providerName}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs uppercase font-semibold text-slate-400">Policy Plan Type</span>
                <p className="font-medium text-slate-800">{policy.policyType || "Comprehensive Health"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs uppercase font-semibold text-slate-400">Inception Date</span>
                <div className="flex items-center gap-1.5 font-medium text-slate-800">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{new Date(policy.startDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs uppercase font-semibold text-slate-400">Expiration Date</span>
                <div className="flex items-center gap-1.5 font-medium text-slate-800">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{new Date(policy.endDate).toLocaleDateString()}</span>
                  {isExpired && (
                    <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                      EXPIRED
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Associated Claims Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <CardTitle className="text-base font-bold text-[#0A2540]">
                Associated Claims History
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Claims filed against this policy contract. Total settled: Rs. {totalClaimsApprovedAmount.toFixed(2)}
              </p>
            </div>
            <Badge variant="primary" className="text-xs">
              {claims.length} {claims.length === 1 ? "Claim" : "Claims"}
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            {claims.length === 0 ? (
              <Table>
                <TableBody>
                  <TableEmpty
                    colSpan={7}
                    message="No claims filed yet"
                    description="No insurance claims have been submitted under this policy."
                  />
                </TableBody>
              </Table>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Claim #</TableHead>
                      <TableHead>Treatment Description</TableHead>
                      <TableHead>Claimed Amount</TableHead>
                      <TableHead>Approved Amount</TableHead>
                      <TableHead>Submitted Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims
                      .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                      .map((c) => (
                        <TableRow key={c.id} className="hover:bg-slate-50/70 transition-colors">
                          <TableCell>
                            <Link
                              href={`/insurance-officer/claims/${c.id}`}
                              className="font-mono font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
                            >
                              <FileText className="w-3.5 h-3.5 text-blue-500 group-hover:scale-110 transition-transform" />
                              <span>{c.claimNumber}</span>
                            </Link>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-xs text-slate-700">
                            {c.treatmentDescription}
                          </TableCell>
                          <TableCell className="font-semibold text-xs text-slate-900">
                            Rs. {c.claimAmount != null ? Number(c.claimAmount).toFixed(2) : "0.00"}
                          </TableCell>
                          <TableCell className="font-bold text-xs text-emerald-600">
                            {c.approvedAmount != null ? `Rs. ${Number(c.approvedAmount).toFixed(2)}` : "—"}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500">
                            {c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={claimStatusVariant[c.status]}>{c.status}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                                onClick={() => router.push(`/insurance-officer/claims/${c.id}`)}
                                className="h-7 text-xs px-2.5 min-w-[76px] whitespace-nowrap"
                              >
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>

                {/* Pagination Controls (Matching Screenshot 2) */}
                {claims.length > pageSize && (
                  <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-white rounded-b-2xl gap-3 text-xs text-slate-500">
                    <div>
                      Showing <span className="font-semibold text-[#0A2540]">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                      <span className="font-semibold text-[#0A2540]">{Math.min(currentPage * pageSize, claims.length)}</span> of{" "}
                      <span className="font-semibold text-[#0A2540]">{claims.length}</span> claims
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

                      {Array.from({ length: Math.ceil(claims.length / pageSize) || 1 }, (_, i) => i + 1).map((pageNum) => (
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
                        onClick={() => setCurrentPage((p) => Math.min(Math.ceil(claims.length / pageSize) || 1, p + 1))}
                        disabled={currentPage === Math.ceil(claims.length / pageSize)}
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
      </div>
    </DashboardLayout>
  );
}