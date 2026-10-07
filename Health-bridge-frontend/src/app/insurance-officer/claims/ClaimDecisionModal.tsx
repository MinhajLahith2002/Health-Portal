"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { insuranceService } from "@/services/insuranceService";
import { InsuranceClaim } from "@/types/insurance";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface ClaimDecisionModalProps {
  claim: InsuranceClaim;
  initialMode?: "APPROVE" | "REJECT" | "REVIEW";
  onClose: () => void;
  onDecided: () => void;
}

const REJECTION_REASONS = [
  "Treatment not covered under policy contract terms",
  "Policy coverage limit exhausted for this benefit year",
  "Supporting medical invoices/receipts incomplete or illegible",
  "Service date falls outside active policy coverage dates",
  "Duplicate claim already processed for this treatment date",
  "Service requires pre-authorization which was not obtained",
  "Custom Reason",
];

export default function ClaimDecisionModal({
  claim,
  initialMode = "REVIEW",
  onClose,
  onDecided,
}: ClaimDecisionModalProps) {
  const [decisionType, setDecisionType] = useState<"APPROVE" | "REJECT">(
    initialMode === "REJECT" ? "REJECT" : "APPROVE"
  );
  const [approvedAmount, setApprovedAmount] = useState<number>(claim.claimAmount || 0);
  const [selectedReason, setSelectedReason] = useState(REJECTION_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const isApprove = decisionType === "APPROVE";
    const rejectionText =
      selectedReason === "Custom Reason" ? customReason.trim() : selectedReason;

    if (!isApprove && !rejectionText) {
      setErrorMessage("Please select or enter a valid reason for claim rejection.");
      return;
    }

    if (isApprove && (approvedAmount <= 0 || isNaN(approvedAmount))) {
      setErrorMessage("Approved amount must be greater than zero.");
      return;
    }

    if (isApprove && approvedAmount > (claim.claimAmount || 0)) {
      setErrorMessage("Approved amount cannot exceed the requested claim amount.");
      return;
    }

    setSubmitting(true);
    try {
      await insuranceService.decideClaim(claim.id, {
        approve: isApprove,
        approvedAmount: isApprove ? Number(approvedAmount) : undefined,
        rejectionReason: !isApprove ? rejectionText : undefined,
      });
      onDecided();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to submit claim decision.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Review Claim #${claim.claimNumber}`}
      description={`Patient: ${claim.patientId} • Policy: ${claim.policyNumber || claim.policyId}`}
      footer={null}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Claim Summary Glance */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Treatment:</span>
            <span className="font-semibold text-slate-800 text-right max-w-[240px] truncate">
              {claim.treatmentDescription || "General Medical Claim"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Claimed Amount:</span>
            <span className="font-bold text-slate-900 text-sm">
              Rs. ${(claim.claimAmount || 0).toFixed(2)}
            </span>
          </div>
          {claim.providerName && (
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Underwriter:</span>
              <span className="font-medium text-slate-700">{claim.providerName}</span>
            </div>
          )}
        </div>

        {/* Decision Toggle */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Decision Outcome
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDecisionType("APPROVE")}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                decisionType === "APPROVE"
                  ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Approve Claim</span>
            </button>
            <button
              type="button"
              onClick={() => setDecisionType("REJECT")}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                decisionType === "REJECT"
                  ? "bg-rose-50 border-rose-500 text-rose-700 shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Reject Claim</span>
            </button>
          </div>
        </div>

        {/* Approve Fields */}
        {decisionType === "APPROVE" && (
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Approved Payout Amount (Rs.) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={claim.claimAmount}
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Max allowable: Rs. ${(claim.claimAmount || 0).toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Reject Fields */}
        {decisionType === "REJECT" && (
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reason for Rejection <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-rose-500"
              >
                {REJECTION_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {selectedReason === "Custom Reason" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Specify Detailed Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Explain why this claim is being declined..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 resize-none"
                  required
                />
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            isLoading={submitting}
            className={
              decisionType === "APPROVE"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-rose-600 hover:bg-rose-700 text-white"
            }
          >
            {decisionType === "APPROVE" ? "Confirm Approval" : "Confirm Rejection"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}