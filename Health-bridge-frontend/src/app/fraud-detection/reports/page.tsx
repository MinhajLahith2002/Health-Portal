"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, FileText, ShieldAlert } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FraudDetectionTabs from "@/components/fraud-detection/FraudDetectionTabs";
import { fraudDetectionService, type FraudRecord } from "@/services/fraudDetectionService";

const BRAND_COLOR: [number, number, number] = [23, 105, 232];
const INK_COLOR: [number, number, number] = [22, 25, 29];
const MUTED_COLOR: [number, number, number] = [107, 118, 128];

const text = (record: FraudRecord | undefined, ...keys: string[]) => {
  const key = keys.find((item) => record?.[item] !== undefined && record[item] !== null);
  return key ? String(record?.[key]) : "-";
};

const titleCase = (key: string) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase());

const severityBand = (alert: FraudRecord) => {
  const severity = text(alert, "severity", "riskLevel", "risk").toUpperCase();
  if (severity === "CRITICAL") return { bg: "bg-[#fde8ee]", fg: "text-[#881337]" };
  if (severity === "HIGH") return { bg: "bg-red-50", fg: "text-red-600" };
  if (severity === "MEDIUM") return { bg: "bg-orange-50", fg: "text-orange-600" };
  return { bg: "bg-emerald-50", fg: "text-emerald-600" };
};

function buildReportPdf(statistics: FraudRecord | undefined, riskStatistics: FraudRecord | undefined, alerts: FraudRecord[]) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;

  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, pageWidth, 90, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("HealthBridge", margin, 38);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Fraud Detection Intelligence Report", margin, 58);
  doc.setFontSize(9);
  doc.text(
    `Generated ${new Date().toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}`,
    margin,
    76,
  );

  let cursorY = 120;

  const drawSectionTitle = (label: string) => {
    doc.setTextColor(...INK_COLOR);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(label, margin, cursorY);
    cursorY += 10;
  };

  const drawKeyValueTable = (record: FraudRecord | undefined) => {
    const rows = Object.entries(record ?? {}).map(([key, value]) => [titleCase(key), String(value)]);
    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [["Metric", "Value"]],
      body: rows.length > 0 ? rows : [["No data available", "-"]],
      theme: "striped",
      headStyles: { fillColor: BRAND_COLOR, textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: INK_COLOR },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 28;
  };

  drawSectionTitle("Alert Statistics");
  drawKeyValueTable(statistics);

  drawSectionTitle("Risk Score Statistics");
  drawKeyValueTable(riskStatistics);

  drawSectionTitle("Recent Alerts");
  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    head: [["Claim ID", "Type", "Severity", "Risk Score", "Date"]],
    body:
      alerts.length > 0
        ? alerts.map((alert) => [
            text(alert, "claimId", "id"),
            text(alert, "title", "alertType", "ruleName"),
            text(alert, "severity", "riskLevel", "risk"),
            text(alert, "riskScore", "score"),
            text(alert, "createdAt", "timestamp", "date"),
          ])
        : [["No recent fraud alerts", "-", "-", "-", "-"]],
    theme: "striped",
    headStyles: { fillColor: BRAND_COLOR, textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: INK_COLOR },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setDrawColor(...MUTED_COLOR);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 40, pageWidth - margin, pageHeight - 40);
    doc.setFontSize(8);
    doc.setTextColor(...MUTED_COLOR);
    doc.setFont("helvetica", "normal");
    doc.text("HealthBridge - Confidential claims intelligence", margin, pageHeight - 26);
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 26, { align: "right" });
  }

  doc.save(`health-bridge-fraud-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export default function FraudReportsPage() {
  const [statistics, setStatistics] = useState<FraudRecord>();
  const [riskStatistics, setRiskStatistics] = useState<FraudRecord>();
  const [alerts, setAlerts] = useState<FraudRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.allSettled([
      fraudDetectionService.getAlertStatistics(),
      fraudDetectionService.getRiskScoreStatistics(),
      fraudDetectionService.getRecentAlerts(),
    ])
      .then(([alertStats, scoreStats, recent]) => {
        if (alertStats.status === "fulfilled") setStatistics(alertStats.value);
        if (scoreStats.status === "fulfilled") setRiskStatistics(scoreStats.value);
        if (recent.status === "fulfilled") setAlerts(recent.value.items);
        if (alertStats.status === "rejected" && scoreStats.status === "rejected" && recent.status === "rejected") {
          setError("Fraud report data is unavailable.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const download = () => buildReportPdf(statistics, riskStatistics, alerts);

  const summaryCards = [
    {
      label: "Total alerts",
      value: text(statistics, "totalAlerts"),
      icon: FileText,
      color: "#1769e8",
      valueClass: "text-[#16191d]",
    },
    {
      label: "Pending review",
      value: text(statistics, "pendingAlerts"),
      icon: AlertTriangle,
      color: "#f97316",
      valueClass: "text-orange-600",
    },
    {
      label: "Confirmed fraud",
      value: text(statistics, "confirmedFraudAlerts"),
      icon: ShieldAlert,
      color: "#ef4444",
      valueClass: "text-red-600",
    },
    {
      label: "False positives",
      value: text(statistics, "falsePositiveAlerts"),
      icon: CheckCircle2,
      color: "#10b981",
      valueClass: "text-emerald-600",
    },
  ];

  return (
    <DashboardLayout pageTitle="Insurance" userRole="INSURANCE_OFFICER">
      <div className="min-h-screen bg-[#fbfcfd] px-4 py-6 text-[#16191d] sm:px-7 lg:px-10 lg:py-9">
        <div className="mx-auto max-w-7xl">
          <FraudDetectionTabs />

          <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6c7680]">
                Claims intelligence
              </p>
              <h1 className="text-[28px] font-semibold sm:text-[32px]">Fraud reports</h1>
              <p className="mt-1 text-sm text-[#7b838c]">Export summaries generated from live fraud endpoints.</p>
            </div>
            <button
              type="button"
              onClick={download}
              disabled={loading || Boolean(error)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1769e8] px-4 py-2 text-xs font-medium text-white disabled:opacity-60"
            >
              <Download className="h-3.5 w-3.5" /> Download PDF report
            </button>
          </header>

          {loading && (
            <div role="status" className="rounded-2xl border bg-white p-8 text-center text-sm text-[#707981]">
              Loading report data...
            </div>
          )}

          {error && (
            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map(({ label, value, icon: Icon, color, valueClass }) => (
                  <article key={label} className="rounded-2xl border border-[#e8eaed] bg-white px-5 py-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-[#606a73]">{label}</p>
                      <Icon className="h-4 w-4" style={{ color }} />
                    </div>
                    <p className={`mt-1 text-[27px] font-semibold ${valueClass}`}>{value}</p>
                  </article>
                ))}
              </section>

              <section className="grid gap-4 lg:grid-cols-2">
                <article className="rounded-2xl border border-[#e7e9ec] bg-white p-5 sm:p-6">
                  <h2 className="text-sm font-semibold">Alert statistics</h2>
                  <div className="mt-5 space-y-3 text-xs">
                    {Object.entries(statistics ?? {}).map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b border-[#edf0f2] pb-2">
                        <span className="text-[#65707a]">{titleCase(key)}</span>
                        <strong className="text-[#30373d]">{String(value)}</strong>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-2xl border border-[#e7e9ec] bg-white p-5 sm:p-6">
                  <h2 className="text-sm font-semibold">Risk score statistics</h2>
                  <div className="mt-5 space-y-3 text-xs">
                    {Object.entries(riskStatistics ?? {}).map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b border-[#edf0f2] pb-2">
                        <span className="text-[#65707a]">{titleCase(key)}</span>
                        <strong className="text-[#30373d]">{String(value)}</strong>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-2xl border border-[#e7e9ec] bg-white p-5 sm:p-6 lg:col-span-2">
                  <h2 className="text-sm font-semibold">Recent alerts included</h2>
                  {alerts.length === 0 ? (
                    <p className="mt-4 text-sm text-[#9299a0]">No recent fraud alerts returned.</p>
                  ) : (
                    <div className="mt-4 overflow-x-auto rounded-xl border border-[#e3e6e9]">
                      <table className="w-full min-w-155 border-collapse text-left">
                        <thead className="bg-[#fbfcfd] text-[9px] uppercase text-[#6d7780]">
                          <tr>
                            {["Claim ID", "Type", "Severity", "Date"].map((heading) => (
                              <th key={heading} className="px-3 py-3 font-medium">
                                {heading}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="text-[11px] text-[#3b4249]">
                          {alerts.map((alert, index) => {
                            const band = severityBand(alert);
                            return (
                              <tr key={index} className="border-t border-[#e9ebed]">
                                <td className="px-3 py-3 font-semibold">{text(alert, "claimId", "id")}</td>
                                <td className="px-3 py-3">{text(alert, "title", "alertType", "ruleName")}</td>
                                <td className="px-3 py-3">
                                  <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${band.bg} ${band.fg}`}>
                                    {text(alert, "severity", "riskLevel", "risk")}
                                  </span>
                                </td>
                                <td className="px-3 py-3">{text(alert, "createdAt", "timestamp", "date")}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </article>
              </section>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
