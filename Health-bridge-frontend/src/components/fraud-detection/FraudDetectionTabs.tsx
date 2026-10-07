"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Dashboard", href: "/fraud-detection" },
  { label: "Alerts", href: "/fraud-detection/alerts" },
  { label: "Claim Analysis", href: "/fraud-detection/claim-analysis" },
  { label: "Reports", href: "/fraud-detection/reports" },
];

export default function FraudDetectionTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Fraud detection navigation" className="mb-6 flex max-w-fit flex-wrap gap-1 rounded-xl border border-[#e4e7ea] bg-white p-1">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-lg px-3 py-2 text-[11px] font-medium ${isActive ? "bg-[#398bff] text-white" : "text-[#707981] hover:bg-[#f5f8fb]"}`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}