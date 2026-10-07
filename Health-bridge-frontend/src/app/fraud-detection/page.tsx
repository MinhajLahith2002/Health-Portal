"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Clock, Info, ShieldAlert, type LucideIcon } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FraudDetectionTabs from "@/components/fraud-detection/FraudDetectionTabs";
import RiskScoreGauge from "@/components/fraud-detection/RiskScoreGauge";
import {
  fraudDetectionService,
  type FraudAlert,
  type FraudRecord,
} from "@/services/fraudDetectionService";

const REFRESH_INTERVAL_MS = 60_000;

const text = (record: FraudRecord | undefined, ...keys: string[]) => {
  const key = keys.find(
    (item) => record?.[item] !== undefined && record[item] !== null,
  );
  return key ? String(record?.[key]) : "-";
};

const idOf = (alert: FraudAlert) =>
  String(alert.alertId ?? alert.id ?? alert.claimId ?? "");

const claimOf = (alert: FraudAlert) => String(alert.claimId ?? "");

const riskBand = (alert: FraudRecord | undefined) => {
  const severity = text(alert, "severity", "riskLevel", "risk").toUpperCase();
  const score = Number(text(alert, "riskScore", "score")) || 0;
  if (severity === "CRITICAL" || score > 75) return { color: "#881337", bg: "bg-[#fde8ee]", fg: "text-[#881337]" };
  if (severity === "HIGH" || score > 50) return { color: "#ef4444", bg: "bg-red-50", fg: "text-red-600" };
  if (severity === "MEDIUM" || score > 25) return { color: "#f97316", bg: "bg-orange-50", fg: "text-orange-600" };
  return { color: "#10b981", bg: "bg-emerald-50", fg: "text-emerald-600" };
};

export default function FraudDetectionPage() {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [statistics, setStatistics] = useState<FraudRecord>();
  const [selectedClaim, setSelectedClaim] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadingRef = useRef(false);

  const load = useCallback(async () => {
    if (loadingRef.current) {
      return;
    }

    loadingRef.current = true;

    try {
      const [recent, alertStats] = await Promise.allSettled([
        fraudDetectionService.getRecentAlerts(),
        fraudDetectionService.getAlertStatistics(),
      ]);

      if (recent.status === "fulfilled") {
        setAlerts(recent.value.items as FraudAlert[]);
      }
      if (alertStats.status === "fulfilled") {
        setStatistics(alertStats.value);
      }

      if ([recent, alertStats].every((result) => result.status === "rejected")) {
        setError("Fraud detection data is unavailable. Please try again.");
      } else {
        setError(null);
      }
    } catch {
      setError("Fraud detection data is unavailable. Please try again.");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void load();
    }, 0);

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void load();
      }
    }, REFRESH_INTERVAL_MS);

    const onFocus = () => {
      if (document.visibilityState === "visible") {
        void load();
      }
    };

    window.addEventListener("focus", onFocus);

    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  const selectedAlert = alerts[selectedClaim];
  const selectedRiskScore = Number(text(selectedAlert, "riskScore", "score")) || 0;
  const selectedSeverity = text(selectedAlert, "severity", "riskLevel", "risk").toUpperCase();
  const metricCards: {
    label: string;
    metric: string;
    detail: string;
    Icon: LucideIcon;
    iconColor: string;
    valueColor: string;
  }[] = [
    {
      label: "Total flagged claims",
      metric: text(statistics, "totalAlerts", "totalFlaggedClaims", "total"),
      detail: "Across all providers",
      Icon: Info,
      iconColor: "#1769e8",
      valueColor: "text-[#16191d]",
    },
    {
      label: "High risk count",
      metric: text(statistics, "criticalSeverityAlerts", "highRiskCount", "highRiskAlerts"),
      detail: "Needs immediate review",
      Icon: AlertTriangle,
      iconColor: "#ef4444",
      valueColor: "text-red-600",
    },
    {
      label: "Under review",
      metric: text(statistics, "pendingAlerts", "underReview", "pendingReview", "openAlerts"),
      detail: "Pending analyst action",
      Icon: Clock,
      iconColor: "#1769e8",
      valueColor: "text-[#16191d]",
    },
    {
      label: "Confirmed fraud",
      metric: text(statistics, "confirmedFraudAlerts", "confirmedFraud", "confirmedFraudCount"),
      detail: "Escalated cases",
      Icon: ShieldAlert,
      iconColor: "#ef4444",
      valueColor: "text-red-600",
    },
  ];

  return (
    <DashboardLayout pageTitle="Insurance" userRole="INSURANCE_OFFICER">
      <div className="min-h-screen bg-[#fbfcfd] px-4 py-6 text-[#16191d] sm:px-7 lg:px-10 lg:py-9">
        <div className="mx-auto max-w-7xl">
          <FraudDetectionTabs />

          <header className="mb-7">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6c7680]">
              Claims intelligence
            </p>
            <h1 className="text-[28px] font-semibold sm:text-[32px]">
              Fraud detection
            </h1>
            <p className="mt-1 text-sm text-[#7b838c]">
              Monitor suspicious claims and coordinate investigations.
            </p>
          </header>

          {loading && (
            <div
              role="status"
              className="rounded-2xl border border-[#e7e9ec] bg-white p-8 text-center text-sm text-[#707981]"
            >
              Loading fraud detection data...
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {metricCards.map(({ label, metric, detail, Icon, iconColor, valueColor }) => {
                  return (
                    <article
                      key={label}
                      className="rounded-2xl border border-[#e8eaed] bg-white px-5 py-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] text-[#606a73]">{label}</p>
                        <Icon className="h-4 w-4" style={{ color: iconColor }} />
                      </div>
                      <p className={`mt-1 text-[27px] font-semibold ${valueColor}`}>{metric}</p>
                      <p className="mt-2 text-[10px] text-[#9299a0]">{detail}</p>
                    </article>
                  );
                })}
              </section>

              <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
                <article className="rounded-2xl border border-[#e7e9ec] bg-white p-5 sm:p-6">
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold">Flagged claims</h2>
                      <p className="mt-1 text-[11px] text-[#9299a0]">
                        Risk-scored claims requiring investigation
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-[#e3e6e9]">
                    <table className="w-full min-w-155 border-collapse text-left">
                      <thead className="bg-[#fbfcfd] text-[9px] uppercase text-[#6d7780]">
                        <tr>
                          {["Claim ID", "Patient", "Provider", "Risk score", "Flag reason", "Date"].map(
                            (heading) => (
                              <th key={heading} className="px-3 py-3 font-medium">
                                {heading}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>

                      <tbody className="text-[11px] text-[#3b4249]">
                        {alerts.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-3 py-10 text-center text-[#9299a0]">
                              No recent fraud alerts.
                            </td>
                          </tr>
                        ) : (
                          alerts.map((alert) => {
                            const band = riskBand(alert);
                            const scoreValue = Math.max(0, Math.min(100, Number(text(alert, "riskScore", "score")) || 0));
                            return (
                              <tr key={idOf(alert)} className="border-t border-[#e9ebed]">
                                <td className="px-3 py-3 font-semibold">
                                  {text(alert, "claimId", "id")}
                                </td>
                                <td className="px-3 py-3">
                                  {text(alert, "patientName", "patient", "memberName")}
                                </td>
                                <td className="px-3 py-3">
                                  {text(alert, "providerName", "provider")}
                                </td>
                                <td className="px-3 py-3">
                                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#edf0f2]">
                                    <div
                                      className="h-full rounded-full"
                                      style={{ width: `${scoreValue}%`, backgroundColor: band.color }}
                                    />
                                  </div>
                                </td>
                                <td className="px-3 py-3">
                                  <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${band.bg} ${band.fg}`}>
                                    {text(alert, "title", "alertType", "description")}
                                  </span>
                                </td>
                                <td className="px-3 py-3">
                                  {text(alert, "createdAt", "timestamp", "date")}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </article>

                <div className="space-y-4">
                  <article className="rounded-2xl border border-[#e7e9ec] bg-white p-5 sm:p-6">
                    <h2 className="text-sm font-semibold">Claim risk score</h2>
                    {alerts.length === 0 ? (
                      <p className="mt-5 text-sm text-[#9299a0]">No flagged claims returned.</p>
                    ) : (
                      <select
                        value={selectedClaim}
                        onChange={(event) => setSelectedClaim(Number(event.target.value))}
                        className="mt-4 w-full rounded-lg border border-[#e4e7ea] bg-white px-2 py-2 text-xs"
                      >
                        {alerts.map((alert, index) => (
                          <option key={idOf(alert)} value={index}>
                            {claimOf(alert)}
                          </option>
                        ))}
                      </select>
                    )}
                  </article>

                  {alerts.length > 0 && (
                    <RiskScoreGauge
                      score={selectedRiskScore}
                      label={selectedSeverity === "-" ? "UNSCORED" : selectedSeverity}
                    />
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
