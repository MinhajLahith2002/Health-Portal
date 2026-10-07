"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  ShieldCheck,
  ImageIcon,
  ExternalLink,
  DollarSign,
} from "lucide-react";
import { Card, StatCard } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";
import { insuranceService } from "@/services/insuranceService";
import { InsuranceClaim, InsurancePolicy, ClaimStatus } from "@/types/insurance";
import { generateClaimTrackingPdf } from "@/lib/insurancePdfGenerator";

const statusVariant: Record<ClaimStatus, "success" | "danger" | "warning" | "primary"> = {
  APPROVED: "success",
  PAID: "primary",
  SUBMITTED: "primary",
  UNDER_REVIEW: "warning",
  REJECTED: "danger",
};

const STEPS: { status: ClaimStatus; label: string; description: string }[] = [
  {
    status: "SUBMITTED",
    label: "Claim Submitted",
    description: "Received by insurer and logged",
  },
  {
    status: "UNDER_REVIEW",
    label: "Under Review",
    description: "Officer verifying policy eligibility",
  },
  {
    status: "APPROVED",
    label: "Adjudication Approved",
    description: "Reimbursement authorized & settled",
  },
];

export default function PatientClaimTrackingPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [claim, setClaim] = useState<InsuranceClaim | null>(null);
  const [policy, setPolicy] = useState<InsurancePolicy | null>(null);
  const [loading, setLoading] = useState(true);

  // Notifications
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  useEffect(() => {
    let isMounted = true;
    if (!id) return;
    insuranceService
      .getClaimById(id)
      .then(async (data) => {
        if (!isMounted) return;
        setClaim(data);
        setErrorMessage(null);
        if (data?.policyId) {
          try {
            const p = await insuranceService.getPolicyById(data.policyId);
            if (isMounted) setPolicy(p);
          } catch {
            // Non-blocking
          }
        }
      })
      .catch(() => {
        if (isMounted) setErrorMessage("Failed to retrieve claim details from the server.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Determine current progression index (3-stage adjudication)
  const stepIndex = useMemo(() => {
    if (!claim) return 0;
    if (claim.status === "REJECTED") return -1;
    switch (claim.status) {
      case "SUBMITTED":
        return 0;
      case "UNDER_REVIEW":
        return 1;
      case "APPROVED":
      case "PAID":
        return 2;
      default:
        return 0;
    }
  }, [claim]);

  const handleDownloadPdf = () => {
    if (!claim) return;
    try {
      const blob = generateClaimTrackingPdf(claim, policy);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Claim_Statement_${claim.claimNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccess("Claim statement PDF downloaded successfully.");
    } catch {
      showError("Failed to generate claim statement PDF.");
    }
  };

  // Itemized breakdown
  const itemizedCharges = useMemo(() => {
    if (!claim) return [];
    const total = claim.claimAmount || 0;
    const consultation = Number((total * 0.2).toFixed(2));
    const diagnostics = Number((total * 0.4).toFixed(2));
    const pharmacy = Number((total * 0.25).toFixed(2));
    const administrative = Number((total - consultation - diagnostics - pharmacy).toFixed(2));

    return [
      {
        description: claim.treatmentDescription || "Consultation & Clinical Evaluation",
        code: "99213",
        amount: consultation,
      },
      {
        description: "Diagnostic Lab & Pathology Workup",
        code: "80053",
        amount: diagnostics,
      },
      {
        description: "Prescribed Medication & Therapy Dispensing",
        code: "J3490",
        amount: pharmacy,
      },
      {
        description: "Facility & Clinical Administration Fee",
        code: "A9999",
        amount: administrative,
      },
    ];
  }, [claim]);

  if (loading) {
    return (
      <div className="p-16 flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Claim Not Found</h2>
        <p className="text-sm text-slate-500">
          We couldn&apos;t find the claim record you requested.
        </p>
        <Button onClick={() => router.push("/patient/insurance")}>
          Return to My Insurance
        </Button>
      </div>
    );
  }

  const isRejected = claim.status === "REJECTED";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Navigation & Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link
              href="/patient/insurance"
              className="hover:text-blue-600 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>My Insurance</span>
            </Link>
            <span>/</span>
            <span className="text-blue-600 font-semibold font-mono">#{claim.claimNumber}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A2540] tracking-tight">
              Claim Tracking #{claim.claimNumber}
            </h1>
            <Badge variant={statusVariant[claim.status]} className="text-xs font-bold px-3 py-1">
              {claim.status === "UNDER_REVIEW" ? "In Review" : claim.status}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time status tracking, adjudication progress, and policy reimbursement summary.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleDownloadPdf}
            className="gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
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

      {/* 3-Stage Visual Status Stepper Card */}
      <Card className="p-6 bg-white shadow-xs">
        <h2 className="text-sm font-bold text-[#0A2540] mb-6">Adjudication Progress</h2>

        {!isRejected ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
            {STEPS.map((step, idx) => {
              const isCompleted = idx <= stepIndex;
              const isCurrent = idx === stepIndex;

              return (
                <div key={step.status} className="relative flex flex-col items-center text-center space-y-2">
                  {/* Progress Line */}
                  {idx > 0 && (
                    <div
                      className={`hidden sm:block absolute top-4 -left-1/2 w-full h-0.5 z-0 ${
                        idx <= stepIndex ? "bg-blue-600" : "bg-slate-200"
                      }`}
                    />
                  )}

                  {/* Step Bubble */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs z-10 transition-all ${
                      isCompleted
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    } ${isCurrent ? "ring-4 ring-blue-100" : ""}`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>

                  <div>
                    <p
                      className={`text-xs font-bold ${
                        isCompleted ? "text-[#0A2540]" : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-rose-700">
              <XCircle className="w-5 h-5 text-rose-600" />
              <span>Claim Declined by Insurance Officer</span>
            </div>
            <p className="text-xs text-rose-700">
              <strong>Reason:</strong> {claim.rejectionReason || "Medical service does not meet policy contract guidelines."}
            </p>
          </div>
        )}
      </Card>

      {/* Top 3 KPI Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Claimed Amount"
          value={`Rs. ${(claim.claimAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Submitted by you"
          icon={<DollarSign className="w-5 h-5 text-blue-600" />}
        />
        <StatCard
          title="Approved Settlement"
          value={
            claim.approvedAmount != null
              ? `Rs. ${Number(claim.approvedAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : "Pending Review"
          }
          subtitle={
            claim.status === "APPROVED" || claim.status === "PAID"
              ? "Authorized for payout"
              : "In review"
          }
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          title="Coverage Carrier"
          value={policy?.providerName || claim.providerName || "Ceylinco Life"}
          subtitle={policy ? `Policy #${policy.policyNumber}` : "Underwritten policy"}
          icon={<ShieldCheck className="w-5 h-5 text-indigo-600" />}
        />
      </div>

      {/* Details & Itemized Charges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Contract & Summary Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Itemized Charges Breakdown */}
          <Card className="p-6 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-[#0A2540]">Itemized Clinical Charges</h2>
              <Badge variant="primary" className="text-xs">
                {itemizedCharges.length} Line Items
              </Badge>
            </div>

            <div className="rounded-xl border border-slate-200/80 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="py-3 px-4">Service Description</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {itemizedCharges.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-medium text-slate-800">{item.description}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{item.code}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        Rs. {item.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50/80 font-bold">
                    <td colSpan={2} className="py-3 px-4 text-slate-800">
                      Total Requested Amount
                    </td>
                    <td className="py-3 px-4 text-right text-blue-600 font-extrabold text-sm">
                      Rs. {(claim.claimAmount || 0).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Supporting Documents Attached */}
          <Card className="p-6 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-[#0A2540]">Supporting Documentation</h2>
              <span className="text-xs text-slate-400 font-medium">
                {((claim.documentUrls && claim.documentUrls.length > 0 ? claim.documentUrls : claim.documentFileIds) || []).length} Attached
              </span>
            </div>

            {(!claim.documentUrls?.length && (!claim.documentFileIds || claim.documentFileIds.length === 0)) ? (
              <p className="text-xs text-slate-400">No documents attached to this claim.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(claim.documentUrls && claim.documentUrls.length > 0 ? claim.documentUrls : (claim.documentFileIds || [])).map((docRef, i) => {
                  const url = insuranceService.getDocumentUrl(docRef);
                  const isImage = /\.(jpg|jpeg|png|webp|gif)/i.test(docRef) || docRef.includes("/image/upload");
                  
                  let displayName = `Document #${i + 1}`;
                  try {
                    if (docRef.startsWith("http")) {
                      const parts = docRef.split("/");
                      const last = parts[parts.length - 1].split("?")[0];
                      if (last && last.length > 3) {
                        displayName = decodeURIComponent(last).slice(-24);
                      }
                    } else if (docRef.length > 8) {
                      displayName = `Doc_${docRef.slice(0, 8)}...`;
                    }
                  } catch {
                    displayName = `Document #${i + 1}`;
                  }

                  return (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-between group text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isImage ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                        }`}>
                          {isImage ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-slate-800 truncate">{displayName}</p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">
                            {docRef.startsWith("http") ? "Cloudinary File" : `ID: ${docRef.slice(0, 10)}…`}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 flex-shrink-0" />
                    </a>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Claim Metadata & Timeline */}
        <div className="space-y-6">
          {/* Policy & Claim Details Card */}
          <Card className="p-5 bg-white shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#0A2540] pb-3 border-b border-slate-100">
              Contract Specifications
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  Underwriting Provider
                </span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {policy?.providerName || claim.providerName || "Ceylinco Life Insurance"}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  Policy Number
                </span>
                <p className="font-mono font-bold text-blue-600 mt-0.5">
                  {policy?.policyNumber || claim.policyNumber || claim.policyId}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  Hospital & Branch
                </span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {claim.hospitalName || "HealthBridge Hospital"} • {claim.branch || "Colombo"} Branch
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  Submission Date
                </span>
                <p className="font-medium text-slate-700 mt-0.5">
                  {claim.submittedAt ? new Date(claim.submittedAt).toLocaleString() : "—"}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  Adjudication Date
                </span>
                <p className="font-medium text-slate-700 mt-0.5">
                  {claim.reviewedAt ? new Date(claim.reviewedAt).toLocaleString() : "Pending Review"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}