"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  actions?: React.ReactNode;
  badge?: {
    text: string;
    variant?: "blue" | "green" | "red" | "yellow" | "purple" | "gray";
  };
}

const badgeVariants = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-emerald-100 text-emerald-700",
  red: "bg-red-100 text-red-700",
  yellow: "bg-yellow-100 text-yellow-700",
  purple: "bg-purple-100 text-purple-700",
  gray: "bg-slate-100 text-slate-700",
};

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  backHref,
  actions,
  badge,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
        )}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            {badge && (
              <span
                className={`px-2.5 py-1 text-xs font-semibold rounded-full ${badgeVariants[badge.variant || "gray"]}`}
              >
                {badge.text}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};

export default PageHeader;