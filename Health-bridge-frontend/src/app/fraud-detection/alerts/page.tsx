"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FraudDetectionTabs from "@/components/fraud-detection/FraudDetectionTabs";
import Pagination from "@/components/ui/Pagination";
import { fraudDetectionService, type FraudAlert, type FraudRecord, type FraudReviewRequest } from "@/services/fraudDetectionService";

const PAGE_SIZE = 5;

const text = (record: FraudRecord, ...keys: string[]) => {
  const key = keys.find((item) => record[item] !== undefined && record[item] !== null);
  return key ? String(record[key]) : "-";
};
const idOf = (alert: FraudAlert) => String(alert.alertId ?? alert.id ?? "");
const claimOf = (alert: FraudAlert) => String(alert.claimId ?? "");
const statusOf = (alert: FraudAlert) => text(alert, "status").toUpperCase();
const isReviewable = (alert: FraudAlert) => {
  const status = statusOf(alert);
  return status === "-" || status === "PENDING" || status === "UNDER_REVIEW";
};

export default function FraudAlertsPage() {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [stats, setStats] = useState<FraudRecord>();
  const [filter, setFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.allSettled([
      fraudDetectionService.getPendingAlerts(),
      fraudDetectionService.getHighRiskAlerts(),
      fraudDetectionService.getRecentAlerts(),
      fraudDetectionService.getAlertStatistics(),
    ]).then(([pending, highRisk, recent, statistics]) => {
      const merged = [
        ...(pending.status === "fulfilled" ? pending.value.items : []),
        ...(highRisk.status === "fulfilled" ? highRisk.value.items : []),
        ...(recent.status === "fulfilled" ? recent.value.items : []),
      ];
      setAlerts(Array.from(new Map(merged.map((item) => [idOf(item), item])).values()) as FraudAlert[]);
      if (statistics.status === "fulfilled") setStats(statistics.value);
      if ([pending, highRisk, recent, statistics].every((result) => result.status === "rejected")) {
        setError("Fraud alerts are unavailable. Please try again.");
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    const initialLoad = window.setTimeout(load, 0);
    const interval = window.setInterval(load, 60000);
    window.addEventListener("focus", load);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
      window.removeEventListener("focus", load);
    };
  }, []);

  const visible = useMemo(
    () =>
      filter === "ALL"
        ? alerts
        : alerts.filter((alert) => text(alert, "severity", "riskLevel", "risk").toUpperCase() === filter),
    [alerts, filter],
  );
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedAlerts = visible.slice((safeCurrentPage - 1) * PAGE_SIZE, safeCurrentPage * PAGE_SIZE);

  const review = async (alert: FraudAlert, status: FraudReviewRequest["status"]) => {
    setReviewing(idOf(alert));
    setMessage(null);
    try {
      await fraudDetectionService.reviewAlert(idOf(alert), { status, reviewNotes: "Reviewed from fraud alerts" });
      setAlerts((current) => current.filter((item) => idOf(item) !== idOf(alert)));
      setMessage("Alert review saved.");
      // Refresh statistics so the dashboard counts reflect this review immediately.
      fraudDetectionService.getAlertStatistics().then(setStats).catch(() => undefined);
    } catch {
      setMessage("The alert review could not be saved.");
    } finally {
      setReviewing(null);
    }
  };

  return (
    <DashboardLayout pageTitle="Insurance" userRole="INSURANCE_OFFICER">
      <div className="min-h-screen bg-[#fbfcfd] px-4 py-6 text-[#16191d] sm:px-7 lg:px-10 lg:py-9">
        <div className="mx-auto max-w-7xl">
          <FraudDetectionTabs />
          <header className="mb-7">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6c7680]">Claims intelligence</p>
            <h1 className="text-[28px] font-semibold sm:text-[32px]">Fraud alerts</h1>
            <p className="mt-1 text-sm text-[#7b838c]">Review signals that need analyst attention.</p>
          </header>
          {message && (
            <p role="status" className="mb-4 rounded-lg bg-[#e8fbf4] px-4 py-3 text-xs text-[#008b65]">
              {message}
            </p>
          )}
          {loading && (
            <div role="status" className="rounded-2xl border bg-white p-8 text-center text-sm text-[#707981]">
              Loading fraud alerts...
            </div>
          )}
          {error && (
            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">
              {error}
              <button type="button" onClick={load} className="ml-3 underline">
                Retry
              </button>
            </div>
          )}
          {!loading && !error && (
            <section className="rounded-2xl border border-[#e7e9ec] bg-white p-5 sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold">Recent alerts</h2>
                  <p className="mt-1 text-[11px] text-[#9299a0]">
                    {text(stats ?? {}, "pendingAlerts", "openAlerts", "totalPending")} open alerts
                  </p>
                </div>
                <select
                  aria-label="Filter alerts"
                  value={filter}
                  onChange={(event) => {
                    setFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border px-3 py-2 text-xs"
                >
                  <option value="ALL">All risks</option>
                  <option value="HIGH">High risk</option>
                  <option value="MEDIUM">Medium risk</option>
                  <option value="LOW">Low risk</option>
                </select>
              </div>
              {visible.length === 0 ? (
                <div className="py-12 text-center text-sm text-[#9299a0]">No fraud alerts match this filter.</div>
              ) : (
                <div className="divide-y divide-[#edf0f2]">
                  {paginatedAlerts.map((alert) => {
                    const reviewable = isReviewable(alert);
                    return (
                      <article
                        key={idOf(alert)}
                        className="flex flex-col gap-4 py-4 first:pt-0 sm:flex-row sm:items-start sm:justify-between"
                      >
                        <div className="flex gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff0f1] text-[#ef1624]">
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-xs font-semibold">{text(alert, "title", "alertType", "ruleName")}</h3>
                              <span className="rounded-full bg-[#fff7e8] px-2 py-1 text-[10px]">
                                {text(alert, "severity", "riskLevel", "risk")} risk
                              </span>
                              {!reviewable && (
                                <span className="rounded-full bg-[#eef3fb] px-2 py-1 text-[10px] text-[#1769e8]">
                                  {statusOf(alert).replaceAll("_", " ")}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 max-w-2xl text-[11px] leading-5 text-[#707981]">
                              {text(alert, "description", "reason", "details")}
                            </p>
                            <p className="mt-2 text-[10px] text-[#a0a7ad]">
                              {claimOf(alert)} · {text(alert, "providerName", "provider")} · {text(alert, "createdAt", "timestamp", "date")}
                            </p>
                            {reviewable && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  disabled={reviewing === idOf(alert)}
                                  onClick={() => review(alert, "CONFIRMED_FRAUD")}
                                  className="rounded-lg bg-[#ef1624] px-3 py-1.5 text-[10px] font-medium text-white disabled:opacity-50"
                                >
                                  Confirm fraud
                                </button>
                                <button
                                  type="button"
                                  disabled={reviewing === idOf(alert)}
                                  onClick={() => review(alert, "FALSE_POSITIVE")}
                                  className="rounded-lg border px-3 py-1.5 text-[10px] font-medium disabled:opacity-50"
                                >
                                  False positive
                                </button>
                                <button
                                  type="button"
                                  disabled={reviewing === idOf(alert)}
                                  onClick={() => review(alert, "ESCALATED")}
                                  className="rounded-lg border border-[#1769e8] px-3 py-1.5 text-[10px] font-medium text-[#1769e8] disabled:opacity-50"
                                >
                                  Escalate
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <Link
                          href={`/fraud-detection/claim-analysis?claimId=${encodeURIComponent(claimOf(alert))}`}
                          className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-[#1769e8]"
                        >
                          Analyze claim <ArrowRight className="h-3 w-3" />
                        </Link>
                      </article>
                    );
                  })}
                </div>
              )}
              {visible.length > 0 && (
                <Pagination
                  currentPage={safeCurrentPage}
                  totalPages={totalPages}
                  totalRecords={visible.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setCurrentPage}
                />
              )}
            </section>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
