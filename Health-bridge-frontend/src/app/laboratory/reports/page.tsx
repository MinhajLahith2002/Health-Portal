"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/app/dashboard/layout";
import { getAllTestOrders, getAllSamples, getAllResults } from "../api/labApi";
import { LabTest, LabSample, LabResult } from "../types";
import { patientService, PatientOption } from "@/services/prescriptionService";
import { FileDown, FileSpreadsheet, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

type ReportKey =
    | "testResult"
    | "testRequest"
    | "sampleTracking"
    | "diagnosticSummary"
    | "labPerformance"
    | "turnaroundTime";

interface ReportDef {
    key: ReportKey;
    title: string;
    description: string;
}

const REPORTS: ReportDef[] = [
    { key: "testResult", title: "Laboratory Test Result Report", description: "All test results with parameters and status" },
    { key: "testRequest", title: "Test Request Report", description: "All test orders with priority and status" },
    { key: "sampleTracking", title: "Sample Tracking Report", description: "Sample collection and lab receipt tracking" },
    { key: "diagnosticSummary", title: "Diagnostic Summary Report", description: "Published results with abnormal/critical flags" },
    { key: "labPerformance", title: "Laboratory Performance Report", description: "Volume and status breakdown overview" },
    { key: "turnaroundTime", title: "Test Turnaround Time Report", description: "Time from request to result for each order" },
];

export default function ReportsPage() {
    const [orders, setOrders] = useState<LabTest[]>([]);
    const [samples, setSamples] = useState<LabSample[]>([]);
    const [results, setResults] = useState<LabResult[]>([]);
    const [patients, setPatients] = useState<PatientOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState<string | null>(null);

    useEffect(() => {
        const loadAll = async () => {
            try {
                const [o, s, r, p] = await Promise.all([
                    getAllTestOrders(),
                    getAllSamples(),
                    getAllResults(),
                    patientService.getAllPatients(),
                ]);
                setOrders(Array.isArray(o) ? o : []);
                setSamples(Array.isArray(s) ? s : []);
                setResults(Array.isArray(r) ? r : []);
                setPatients(Array.isArray(p) ? p : []);
            } catch (e) {
                console.error("Failed to load report data", e);
            } finally {
                setLoading(false);
            }
        };
        loadAll();
    }, []);

    const patientName = (id: string) => patients.find((p) => p.value === id)?.label || id;

    // ---------- Data builders for each report ----------

    const buildTestResultRows = () =>
        results.map((r) => ({
            "Result ID": r.id.slice(-8),
            "Patient": patientName(r.patientId),
            "Parameters": r.parameters.map((p) => `${p.parameterName}: ${p.value} ${p.unit}`).join("; "),
            "Critical": r.critical ? "Yes" : "No",
            "Abnormal": r.abnormal ? "Yes" : "No",
            "Status": r.status,
            "Resulted At": r.resultedAt ? new Date(r.resultedAt).toLocaleString() : "-",
        }));

    const buildTestRequestRows = () =>
        orders.map((o) => ({
            "Order No": o.testOrderNumber || o.id.slice(-8),
            "Patient": patientName(o.patientId),
            "Doctor ID": o.doctorId,
            "Tests": o.requestedTests.join(", "),
            "Priority": o.priority,
            "Status": o.status,
            "Requested At": o.requestedAt ? new Date(o.requestedAt).toLocaleString() : "-",
        }));

    const buildSampleTrackingRows = () =>
        samples.map((s) => ({
            "Sample ID": s.id.slice(-8),
            "Test Order ID": s.testOrderId?.slice(-8) || "-",
            "Barcode": s.barcodeId,
            "Type": s.sampleType,
            "Status": s.status,
            "Collected By": s.collectedBy,
            "Collected At": s.collectedAt ? new Date(s.collectedAt).toLocaleString() : "-",
            "Received At": s.receivedAt ? new Date(s.receivedAt).toLocaleString() : "-",
        }));

    const buildDiagnosticSummaryRows = () =>
        results
            .filter((r) => r.status === "PUBLISHED")
            .map((r) => ({
                "Patient": patientName(r.patientId),
                "Abnormal Parameters": r.parameters.filter((p) => p.outOfRange).map((p) => p.parameterName).join(", ") || "None",
                "Flag": r.critical ? "CRITICAL" : r.abnormal ? "Abnormal" : "Normal",
                "Published At": r.publishedAt ? new Date(r.publishedAt).toLocaleString() : "-",
            }));

    const buildPerformanceRows = () => {
        const statusCounts: Record<string, number> = {};
        orders.forEach((o) => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
        const priorityCounts: Record<string, number> = {};
        orders.forEach((o) => { priorityCounts[o.priority] = (priorityCounts[o.priority] || 0) + 1; });

        return [
            { "Metric": "Total Test Orders", "Value": orders.length },
            { "Metric": "Total Samples Collected", "Value": samples.length },
            { "Metric": "Total Results Entered", "Value": results.length },
            { "Metric": "Critical Results", "Value": results.filter((r) => r.critical).length },
            { "Metric": "Published Results", "Value": results.filter((r) => r.status === "PUBLISHED").length },
            ...Object.entries(statusCounts).map(([k, v]) => ({ "Metric": `Orders — ${k}`, "Value": v })),
            ...Object.entries(priorityCounts).map(([k, v]) => ({ "Metric": `Priority — ${k}`, "Value": v })),
        ];
    };

    const buildTurnaroundRows = () =>
        orders
            .map((o) => {
                const relatedResult = results.find((r) => r.testOrderId === o.id);
                if (!relatedResult || !relatedResult.resultedAt) return null;
                const requested = new Date(o.requestedAt).getTime();
                const resulted = new Date(relatedResult.resultedAt).getTime();
                const hours = ((resulted - requested) / (1000 * 60 * 60)).toFixed(1);
                return {
                    "Order No": o.testOrderNumber || o.id.slice(-8),
                    "Patient": patientName(o.patientId),
                    "Priority": o.priority,
                    "Requested At": new Date(o.requestedAt).toLocaleString(),
                    "Resulted At": new Date(relatedResult.resultedAt).toLocaleString(),
                    "Turnaround (hrs)": hours,
                };
            })
            .filter(Boolean) as Record<string, string>[];

    const getRowsFor = (key: ReportKey) => {
        switch (key) {
            case "testResult": return buildTestResultRows();
            case "testRequest": return buildTestRequestRows();
            case "sampleTracking": return buildSampleTrackingRows();
            case "diagnosticSummary": return buildDiagnosticSummaryRows();
            case "labPerformance": return buildPerformanceRows();
            case "turnaroundTime": return buildTurnaroundRows();
        }
    };

    // ---------- Export functions ----------

    const exportPdf = (report: ReportDef) => {
        setGenerating(`${report.key}-pdf`);
        try {
            const rows = getRowsFor(report.key);
            if (rows.length === 0) {
                alert("No data available for this report.");
                return;
            }
            const doc = new jsPDF({ orientation: "landscape" });
            doc.setFontSize(14);
            doc.text(report.title, 14, 15);
            doc.setFontSize(9);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 21);

            const headers = Object.keys(rows[0]);
            const body = rows.map((row) => headers.map((h) => String((row as any)[h] ?? "-")));

            autoTable(doc, {
                startY: 26,
                head: [headers],
                body,
                styles: { fontSize: 7, cellPadding: 2 },
                headStyles: { fillColor: [37, 99, 235] },
            });

            doc.save(`${report.key}-${Date.now()}.pdf`);
        } finally {
            setGenerating(null);
        }
    };

    const exportExcel = (report: ReportDef) => {
        setGenerating(`${report.key}-xlsx`);
        try {
            const rows = getRowsFor(report.key);
            if (rows.length === 0) {
                alert("No data available for this report.");
                return;
            }
            const worksheet = XLSX.utils.json_to_sheet(rows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, report.title.slice(0, 31));
            XLSX.writeFile(workbook, `${report.key}-${Date.now()}.xlsx`);
        } finally {
            setGenerating(null);
        }
    };

    const rowCount = (key: ReportKey) => getRowsFor(key).length;

    return (
        <DashboardLayout pageTitle="Laboratory Reports">
            <h2 className="text-lg font-semibold text-slate-900">Laboratory Reports</h2>

            {loading ? (
                <p className="text-sm text-slate-400">Loading report data...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {REPORTS.map((r) => (
                        <div key={r.key} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">{r.title}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{r.description}</p>
                                </div>
                                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full whitespace-nowrap">
                  {rowCount(r.key)} rows
                </span>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={() => exportPdf(r)}
                                    disabled={generating === `${r.key}-pdf`}
                                    className="flex items-center gap-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg disabled:opacity-50"
                                >
                                    {generating === `${r.key}-pdf` ? <Loader2 size={12} className="animate-spin" /> : <FileDown size={12} />}
                                    PDF
                                </button>
                                <button
                                    onClick={() => exportExcel(r)}
                                    disabled={generating === `${r.key}-xlsx`}
                                    className="flex items-center gap-1.5 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg disabled:opacity-50"
                                >
                                    {generating === `${r.key}-xlsx` ? <Loader2 size={12} className="animate-spin" /> : <FileSpreadsheet size={12} />}
                                    Excel
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}