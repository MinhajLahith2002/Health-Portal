"use client";

import { useState, useEffect, useCallback } from "react";
import { complianceService } from "@/services/complianceService";
import {
  ComplianceReport,
  ComplianceReportRequest,
} from "@/types/hospital";

const TOKEN_KEY = "healthbridge_token";

const isLoginPage = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.location.pathname === "/login" ||
    window.location.pathname === "/"
  );
};

export const useCompliance = () => {
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ================================
  // FETCH ALL REPORTS
  // ================================
  const fetchAllReports = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    if (isLoginPage()) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      console.warn(
        "⚠️ Compliance: No authentication token found"
      );

      setReports([]);
      setLoading(false);
      setError("Authentication token not found");

      return;
    }

    console.log(
      "🚀 Compliance: Fetching compliance reports..."
    );

    setLoading(true);
    setError(null);

    try {
      const data =
        await complianceService.getAllReports();

      console.log(
        "✅ Compliance: Reports received:",
        data?.length || 0
      );

      setReports(data || []);
      setLoading(false);
    } catch (err: unknown) {
      console.error(
        "❌ Compliance: Failed to fetch reports",
        err
      );

      let errorMessage =
        "Failed to fetch compliance reports";

      if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setLoading(false);
    }
  }, []);

  // ================================
  // CREATE REPORT
  // ================================
  const createReport = useCallback(
    async (
      data: ComplianceReportRequest
    ): Promise<ComplianceReport> => {
      console.log(
        "🚀 Compliance: Creating report..."
      );

      setLoading(true);
      setError(null);

      try {
        const newReport =
          await complianceService.createReport(data);

        console.log(
          "✅ Compliance: Report created:",
          newReport
        );

        setReports((prev) => [
          ...prev,
          newReport,
        ]);

        return newReport;
      } catch (err: unknown) {
        console.error(
          "❌ Compliance: Failed to create report",
          err
        );

        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to create compliance report";

        setError(errorMessage);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ================================
  // UPDATE REPORT
  // ================================
  const updateReport = useCallback(
    async (
      id: string,
      data: ComplianceReportRequest
    ): Promise<ComplianceReport> => {
      console.log(
        "🚀 Compliance: Updating report:",
        id
      );

      setLoading(true);
      setError(null);

      try {
        const updated =
          await complianceService.updateReport(
            id,
            data
          );

        console.log(
          "✅ Compliance: Report updated:",
          updated
        );

        setReports((prev) =>
          prev.map((report) =>
            report.id === id
              ? updated
              : report
          )
        );

        return updated;
      } catch (err: unknown) {
        console.error(
          "❌ Compliance: Failed to update report",
          err
        );

        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to update compliance report";

        setError(errorMessage);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ================================
  // DELETE REPORT
  // ================================
  const deleteReport = useCallback(
    async (id: string): Promise<void> => {
      console.log(
        "🚀 Compliance: Deleting report:",
        id
      );

      setLoading(true);
      setError(null);

      try {
        await complianceService.deleteReport(id);

        console.log(
          "✅ Compliance: Report deleted:",
          id
        );

        setReports((prev) =>
          prev.filter(
            (report) => report.id !== id
          )
        );
      } catch (err: unknown) {
        console.error(
          "❌ Compliance: Failed to delete report",
          err
        );

        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to delete compliance report";

        setError(errorMessage);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ================================
  // GET HOSPITAL REPORTS
  // ================================
  const getHospitalReports = useCallback(
    async (
      hospitalId: string
    ): Promise<ComplianceReport[]> => {
      console.log(
        "🚀 Compliance: Fetching hospital reports:",
        hospitalId
      );

      setLoading(true);
      setError(null);

      try {
        const data =
          await complianceService.getHospitalReports(
            hospitalId
          );

        return data;
      } catch (err: unknown) {
        console.error(
          "❌ Compliance: Failed to fetch hospital reports",
          err
        );

        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch hospital reports";

        setError(errorMessage);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ================================
  // INITIAL FETCH
  // ================================
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const fetchReports = window.setTimeout(() => {
      void fetchAllReports();
    }, 0);

    return () => window.clearTimeout(fetchReports);
  }, [fetchAllReports]);

  return {
    reports,
    loading,
    error,

    fetchAllReports,

    createReport,
    updateReport,
    deleteReport,

    getHospitalReports,
  };
};

