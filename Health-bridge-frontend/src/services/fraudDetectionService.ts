import { type AxiosRequestConfig } from "axios";
import api from "@/lib/axios";

const FRAUD_REQUEST_TIMEOUT_MS = 60_000;

export type FraudRecord = Record<string, unknown>;

export interface FraudAlert extends FraudRecord {
  id?: string | number;
  alertId?: string | number;
  claimId?: string | number;
  title?: string;
  description?: string;
  severity?: string;
  status?: string;
  createdAt?: string;
  provider?: string;
}

export interface FraudList<T extends FraudRecord = FraudRecord> {
  items: T[];
  count: number;
}

export interface FraudReviewRequest {
  status: "CONFIRMED_FRAUD" | "FALSE_POSITIVE" | "ESCALATED";
  reviewNotes: string;
}

function unwrap<T>(value: unknown): T {
  if (value && typeof value === "object" && "data" in value) {
    return (value as { data: T }).data;
  }
  return value as T;
}

function listFrom<T extends FraudRecord>(value: unknown, keys: string[]): FraudList<T> {
  const unwrapped = unwrap<unknown>(value);
  if (Array.isArray(unwrapped)) {
    return { items: unwrapped as T[], count: unwrapped.length };
  }

  if (unwrapped && typeof unwrapped === "object") {
    const record = unwrapped as Record<string, unknown>;
    const items = keys.find((key) => Array.isArray(record[key]));
    if (items) {
      const list = record[items] as T[];
      return {
        items: list,
        count: typeof record.count === "number" ? record.count : list.length,
      };
    }
  }

  return { items: [], count: 0 };
}

function fraudConfig(config?: AxiosRequestConfig): AxiosRequestConfig {
  return {
    timeout: FRAUD_REQUEST_TIMEOUT_MS,
    ...config,
  };
}

export const fraudDetectionService = {
  async getPendingAlerts(): Promise<FraudList<FraudAlert>> {
    return listFrom(await api.get("/fraud/alerts/pending", fraudConfig()), ["alerts", "data", "content", "items"]);
  },

  async getHighRiskAlerts(): Promise<FraudList<FraudAlert>> {
    return listFrom(await api.get("/fraud/alerts/high-risk", fraudConfig()), ["alerts", "data", "content", "items"]);
  },

  async getRecentAlerts(days = 7): Promise<FraudList<FraudAlert>> {
    return listFrom(await api.get("/fraud/alerts/recent", fraudConfig({ params: { days } })), ["alerts", "data", "content", "items"]);
  },

  async getAlertStatistics(): Promise<FraudRecord> {
    return unwrap<FraudRecord>(await api.get("/fraud/alerts/statistics", fraudConfig()));
  },

  async reviewAlert(alertId: string | number, request: FraudReviewRequest): Promise<FraudRecord> {
    return unwrap<FraudRecord>(await api.put(`/fraud/alerts/${alertId}/review`, request, fraudConfig()));
  },

  async getRiskScoreStatistics(): Promise<FraudRecord> {
    return unwrap<FraudRecord>(await api.get("/fraud/risk-scores/statistics", fraudConfig()));
  },

  async getHighRiskPatients(): Promise<FraudList> {
    return listFrom(await api.get("/fraud/risk-scores/high-risk/patients", fraudConfig()), ["patients", "riskScores", "data", "content", "items"]);
  },

  async getHighRiskDoctors(): Promise<FraudList> {
    return listFrom(await api.get("/fraud/risk-scores/high-risk/doctors", fraudConfig()), ["doctors", "riskScores", "data", "content", "items"]);
  },

  async getIncreasingRiskPatients(): Promise<FraudList> {
    return listFrom(await api.get("/fraud/risk-scores/increasing-risk/patients", fraudConfig()), ["patients", "riskScores", "data", "content", "items"]);
  },

  async getSuspiciousDoctors(): Promise<FraudList> {
    return listFrom(await api.get("/fraud/risk-scores/suspicious/doctors", fraudConfig()), ["doctors", "riskScores", "data", "content", "items"]);
  },

  async analyzeClaim(claimId: string | number): Promise<FraudRecord> {
    return unwrap<FraudRecord>(await api.post(`/fraud/alerts/analyze/${claimId}`, undefined, fraudConfig()));
  },
};