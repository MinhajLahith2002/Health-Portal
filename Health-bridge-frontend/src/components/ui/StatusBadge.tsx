"use client";

import React from "react";
import { CheckCircle, Clock, XCircle, AlertCircle, FileText } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  type?: "invoice" | "payment" | "compliance";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = "invoice" }) => {
  const normalized = status?.toUpperCase() || "DRAFT";

  const getStyle = (): { bg: string; text: string; border?: string; icon?: React.ReactNode } => {
    switch (normalized) {
      case "PAID":
      case "COMPLETED":
      case "CONFIRMED":
        return {
          bg: "bg-emerald-100",
          text: "text-emerald-700",
          border: "border-emerald-200",
          icon: <CheckCircle className="w-3.5 h-3.5" />,
        };
      case "UNPAID":
      case "REJECTED":
      case "CANCELLED":
      case "EXPIRED":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          border: "border-red-200",
          icon: <XCircle className="w-3.5 h-3.5" />,
        };
      case "PARTIAL":
      case "PENDING":
      case "PENDING_CONFIRMATION":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          border: "border-yellow-200",
          icon: <Clock className="w-3.5 h-3.5" />,
        };
      case "ISSUED":
      case "IN_PROGRESS":
        return {
          bg: "bg-blue-100",
          text: "text-blue-700",
          border: "border-blue-200",
          icon: <AlertCircle className="w-3.5 h-3.5" />,
        };
      default:
        return {
          bg: "bg-slate-100",
          text: "text-slate-700",
          border: "border-slate-200",
          icon: <FileText className="w-3.5 h-3.5" />,
        };
    }
  };

  const style = getStyle();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${style.bg} ${style.text} ${style.border || ""}`}
    >
      {style.icon}
      {normalized}
    </span>
  );
};

export default StatusBadge;