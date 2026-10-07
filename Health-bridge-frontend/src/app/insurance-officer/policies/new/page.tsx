"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { insuranceService } from "@/services/insuranceService";

const PROVIDER_PRESETS = [
  "Ceylinco Life Insurance",
  "Sri Lanka Insurance Corporation",
  "Softlogic Life",
  "AIA Insurance",
  "Union Assurance",
  "Allianz Insurance",
  "Janashakthi Insurance",
  "Custom Provider",
];

const POLICY_TYPES = [
  "Comprehensive Health",
  "Family Floater",
  "Critical Illness Cover",
  "Hospital Cash Plan",
  "Senior Citizen Health",
  "Dental & Optical Care",
];

export default function NewPolicyPage() {
  const router = useRouter();

  const [patientId, setPatientId] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [selectedProvider, setSelectedProvider] = useState(PROVIDER_PRESETS[0]);
  const [customProvider, setCustomProvider] = useState("");
  const [policyType, setPolicyType] = useState(POLICY_TYPES[0]);
  const [coverageAmount, setCoverageAmount] = useState<number>(500000);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(() => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return nextYear.toISOString().split("T")[0];
  });
  const [submitting, setSubmitting] = useState(false);

  // Self-contained notifications
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const provider = selectedProvider === "Custom Provider" ? customProvider.trim() : selectedProvider;

    if (!patientId.trim()) {
      showError("Patient ID is required.");
      return;
    }
    if (!policyNumber.trim()) {
      showError("Policy Number is required.");
      return;
    }
    if (!provider) {
      showError("Please specify a valid insurance provider.");
      return;
    }
    if (!policyType.trim()) {
      showError("Please select a policy type.");
      return;
    }
    if (!startDate || !endDate) {
      showError("Start date and end date are required.");
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      showError("Policy end date must be after the inception/start date.");
      return;
    }
    if (coverageAmount <= 0) {
      showError("Coverage amount must be greater than zero.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await insuranceService.createPolicy({
        patientId: patientId.trim(),
        policyNumber: policyNumber.trim().toUpperCase(),
        providerName: provider,
        policyType,
        coverageAmount: Number(coverageAmount),
        startDate,
        endDate,
      });

      showSuccess(`Policy ${created.policyNumber} created successfully! Redirecting...`);
      setTimeout(() => {
        router.push(`/insurance-officer/policies/${created.id}`);
      }, 1200);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to create policy.";
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout pageTitle="Register Policy" userRole="INSURANCE_OFFICER">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation & Header */}
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
            <span className="text-blue-600">Register New Policy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A2540] tracking-tight">
            Register New Insurance Policy
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create an underwritten health insurance policy contract and bind it to a patient account.
          </p>
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

        {/* Form Card */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-bold text-[#0A2540] flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Policy Contract Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Patient ID & Policy Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Patient / User ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. PAT-6789 or User ID"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Policy Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. POL-2026-98234"
                    value={policyNumber}
                    onChange={(e) => setPolicyNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Provider & Policy Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Insurance Provider <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-medium"
                  >
                    {PROVIDER_PRESETS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  {selectedProvider === "Custom Provider" && (
                    <div className="mt-2">
                      <Input
                        placeholder="Enter insurance provider name..."
                        value={customProvider}
                        onChange={(e) => setCustomProvider(e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Policy Plan Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={policyType}
                    onChange={(e) => setPolicyType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-medium"
                  >
                    {POLICY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Coverage Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Total Coverage Limit (Rs.) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="text-xs font-bold text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">Rs.</span>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={coverageAmount}
                    onChange={(e) => setCoverageAmount(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold text-slate-800"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Preview: Rs. {Number(coverageAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* Start & End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Inception / Start Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Expiration / End Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/insurance-officer/policies")}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={submitting} className="gap-1.5">
                  <FileCheck className="w-4 h-4" />
                  <span>Register Policy</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}