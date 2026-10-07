"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  Building2,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  X,
  File as FileIcon,
  Shield,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";
import { insuranceService } from "@/services/insuranceService";
import { InsurancePolicy } from "@/types/insurance";

const CLAIM_TYPES = [
  "General Doctor Consultation",
  "Diagnostic Lab & Pathology Tests",
  "Inpatient Hospitalization & Surgery",
  "Prescription & Pharmacy Medication",
  "Emergency Room & Critical Care",
  "Dental & Optical Care",
  "Specialist Clinic Visit",
];

const HOSPITAL_BRANCHES = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kegalle",
  "Ratnapura",
];

export default function SubmitClaimPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [loadingPolicies, setLoadingPolicies] = useState(true);

  // Form Fields
  const [policyId, setPolicyId] = useState("");
  const [claimType, setClaimType] = useState(CLAIM_TYPES[0]);
  const [dateOfService, setDateOfService] = useState(
    new Date().toISOString().split("T")[0]
  );
  const hospitalName = "HealthBridge Hospital";
  const [branch, setBranch] = useState(HOSPITAL_BRANCHES[0]);
  const [treatmentDescription, setTreatmentDescription] = useState("");
  const [claimAmount, setClaimAmount] = useState<number | "">("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Notifications
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
  };

  useEffect(() => {
    insuranceService
      .getMyPolicies()
      .then((all) => {
        const active = all.filter((p) => p.status === "ACTIVE");
        setPolicies(active);
        if (active.length > 0) setPolicyId(active[0].id);
      })
      .catch(() => {
        showError("Failed to retrieve your active insurance policies.");
      })
      .finally(() => setLoadingPolicies(false));
  }, []);

  const selectedPolicy = useMemo(
    () => policies.find((p) => p.id === policyId) || policies[0] || null,
    [policies, policyId]
  );

  const remainingLimit = useMemo(() => {
    if (!selectedPolicy) return 0;
    return Math.max(
      0,
      (selectedPolicy.coverageAmount || 0) - (selectedPolicy.coverageUsed || 0)
    );
  }, [selectedPolicy]);

  // Handle Drag and Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const valid = newFiles.filter((f) => {
      const sizeMb = f.size / (1024 * 1024);
      return sizeMb <= 10;
    });

    if (valid.length < newFiles.length) {
      showError("Some files exceeded the 10MB limit and were skipped.");
    }

    setFiles((prev) => [...prev, ...valid]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!policyId) {
      showError("Please select an active policy to claim against.");
      return;
    }
    if (!hospitalName.trim()) {
      showError("Please enter the hospital name.");
      return;
    }
    if (!treatmentDescription.trim()) {
      showError("Please provide a description of the medical service received.");
      return;
    }
    if (!claimAmount || Number(claimAmount) <= 0) {
      showError("Please enter a valid claim amount greater than zero.");
      return;
    }
    if (Number(claimAmount) > remainingLimit) {
      showError(
        `Claim amount exceeds your remaining policy coverage of Rs. ${remainingLimit.toFixed(2)}.`
      );
      return;
    }
    if (files.length === 0) {
      showError("Please attach at least one supporting document (invoice, bill, or receipt).");
      return;
    }

    // Combine hospital name, branch, and claim type into the treatment description for clear audit trail
    const formattedDescription = `[${claimType}] at ${hospitalName.trim()} (${branch} Branch) on ${dateOfService}: ${treatmentDescription.trim()}`;

    setSubmitting(true);
    try {
      const submitted = await insuranceService.submitClaim(
        {
          policyId,
          treatmentDescription: formattedDescription,
          hospitalName: hospitalName.trim(),
          branch,
          claimAmount: Number(claimAmount),
        },
        files
      );

      showSuccess(`Claim #${submitted.claimNumber} submitted successfully! Redirecting...`);
      setTimeout(() => {
        router.push("/patient/insurance");
      }, 1500);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to submit insurance claim.";
      showError(msg);
      setSubmitting(false);
    }
  };

  if (loadingPolicies) {
    return (
      <div className="p-16 flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  if (policies.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">No Active Policy Found</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          You currently have no active health insurance policy registered in the system. An active policy is required to submit reimbursement claims.
        </p>
        <Button onClick={() => router.push("/patient/insurance")}>
          Return to Insurance Overview
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header & Breadcrumbs (Matching Figma Design) */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
          <Link
            href="/patient/insurance"
            className="hover:text-blue-600 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Insurance</span>
          </Link>
          <span>/</span>
          <span className="text-blue-600 font-semibold">Submit New Claim</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A2540] tracking-tight">
          Submit New Claim
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Please provide the details of your medical service to process your insurance claim.
        </p>
      </div>

      {/* Feedback Banners */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex items-center gap-2 animate-in fade-in duration-200">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2-Column Layout Form (Matching Figma Design) */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Claim Details (2 Cols Span) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 bg-white shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <FileText className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-[#0A2540]">Claim Details</h2>
              </div>

              {/* Row 1: Claim Type & Date of Service */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Claim Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={claimType}
                    onChange={(e) => setClaimType(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500"
                  >
                    {CLAIM_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date of Service <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dateOfService}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setDateOfService(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Hospital Name & Hospital Branch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Hospital Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={hospitalName}
                      readOnly
                      tabIndex={-1}
                      className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-200 bg-slate-100/90 text-slate-700 font-medium cursor-not-allowed select-none focus:outline-none"
                    />
                    <Lock className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Hospital Branch <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500"
                    required
                  >
                    {HOSPITAL_BRANCHES.map((b) => (
                      <option key={b} value={b}>
                        {b} Branch
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Description of Service / Incident */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description of Service / Incident <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={treatmentDescription}
                  onChange={(e) => setTreatmentDescription(e.target.value)}
                  placeholder="Briefly describe the reason for visit and services received..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 resize-none font-normal"
                  required
                />
              </div>

              {/* Row 4: Estimated Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Estimated Amount (Rs.) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="text-xs font-bold text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">Rs.</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={remainingLimit}
                    placeholder="0.00"
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2 text-xs font-bold text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                {claimAmount !== "" && Number(claimAmount) > 0 && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Claim Amount: <strong className="text-slate-700">Rs. {Number(claimAmount).toFixed(2)}</strong>
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column: Policy Info & Documents Upload (Matching Figma Design) */}
          <div className="space-y-6">
            {/* Policy Information Card */}
            <Card className="p-5 bg-white shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-[#0A2540]">Policy Information</h2>
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Policy Number
                  </label>
                  <select
                    value={policyId}
                    onChange={(e) => setPolicyId(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                  >
                    {policies.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.policyNumber} — {p.providerName}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedPolicy && (
                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-blue-800 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Status: {selectedPolicy.status}</span>
                    </div>
                    <p className="text-[11px] text-blue-700">
                      Coverage valid through{" "}
                      {new Date(selectedPolicy.endDate).toLocaleDateString("en-GB", {
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <div className="pt-1 border-t border-blue-200/60 flex justify-between items-center text-[11px]">
                      <span className="text-slate-600">Remaining limit:</span>
                      <span className="font-extrabold text-blue-900">
                        Rs. {remainingLimit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Documents Upload Card (Matching Figma Design) */}
            <Card className="p-5 bg-white shadow-xs space-y-4">
              <div>
                <h2 className="text-sm font-bold text-[#0A2540]">Documents</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload medical bills, receipts, or doctor&apos;s notes.
                </p>
              </div>

              {/* Drag & Drop Upload Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  dragActive
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-slate-200 hover:border-blue-400 bg-slate-50/40"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) addFiles(Array.from(e.target.files));
                  }}
                />
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Click to upload or drag &amp; drop
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  PDF, JPG, PNG (Max 10MB per file)
                </p>
              </div>

              {/* Selected Files List */}
              {files.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Attached Files ({files.length})
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {files.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <FileIcon className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                          <span className="truncate font-medium text-slate-700">
                            {file.name}
                          </span>
                          <span className="text-[10px] text-slate-400 flex-shrink-0">
                            ({(file.size / 1024).toFixed(0)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(i);
                          }}
                          className="text-slate-400 hover:text-red-500 p-1 rounded-lg"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Bottom Action Bar (Matching Figma Design) */}
        <div className="flex items-center justify-center sm:justify-end gap-3 pt-4 border-t border-slate-200/80">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/patient/insurance")}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 px-6 shadow-sm"
          >
            <span>Submit Claim</span>
            <span>&rarr;</span>
          </Button>
        </div>
      </form>
    </div>
  );
}