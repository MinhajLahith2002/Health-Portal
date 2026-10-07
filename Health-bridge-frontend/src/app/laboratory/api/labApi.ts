import { getToken } from "@/lib/auth";
import { LabTest, LabSample, LabResult, TestStatus } from "../types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8088/api/lab";

function authHeaders(): HeadersInit {
    const token = getToken();
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

interface ApiEnvelope<T> {
    success: boolean;
    data: T;
    message?: string;
    statusCode?: number;
    timestamp?: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API Error ${res.status}: ${text || res.statusText}`);
    }
    const json = await res.json();

    // Unwrap the standard ApiResponse envelope: { success, data, message, statusCode }
    if (json && typeof json === "object" && "success" in json && "data" in json) {
        const envelope = json as ApiEnvelope<T>;
        if (!envelope.success) {
            throw new Error(envelope.message || "Request failed");
        }
        return envelope.data;
    }

    // Fallback: response is already the raw data (not wrapped)
    return json as T;
}

export async function createTestOrder(data: Partial<LabTest>): Promise<LabTest> {
    const res = await fetch(`${BASE_URL}/test-orders`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse<LabTest>(res);
}

export async function getAllTestOrders(): Promise<LabTest[]> {
    const res = await fetch(`${BASE_URL}/test-orders`, { headers: authHeaders(), cache: "no-store" });
    return handleResponse<LabTest[]>(res);
}

export async function getTestOrdersByStatus(status: TestStatus): Promise<LabTest[]> {
    const res = await fetch(`${BASE_URL}/test-orders/status/${status}`, { headers: authHeaders(), cache: "no-store" });
    return handleResponse<LabTest[]>(res);
}

export async function collectSample(data: Partial<LabSample>): Promise<LabSample> {
    const res = await fetch(`${BASE_URL}/samples/collect`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse<LabSample>(res);
}

export async function receiveSampleByBarcode(barcodeId: string): Promise<LabSample> {
    const res = await fetch(`${BASE_URL}/samples/receive/${barcodeId}`, { method: "PUT", headers: authHeaders() });
    return handleResponse<LabSample>(res);
}

export async function saveResult(data: Partial<LabResult>): Promise<LabResult> {
    const res = await fetch(`${BASE_URL}/results`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse<LabResult>(res);
}

export async function publishResult(resultId: string): Promise<LabResult> {
    const res = await fetch(`${BASE_URL}/results/${resultId}/publish`, { method: "PUT", headers: authHeaders() });
    return handleResponse<LabResult>(res);
}

export async function getPatientHistory(patientId: string): Promise<LabResult[]> {
    const res = await fetch(`${BASE_URL}/results/patient/${patientId}/history`, { headers: authHeaders(), cache: "no-store" });
    return handleResponse<LabResult[]>(res);
}

export async function getAllSamples(): Promise<LabSample[]> {
    const res = await fetch(`${BASE_URL}/samples`, { headers: authHeaders(), cache: "no-store" });
    return handleResponse<LabSample[]>(res);
}

export async function getAllResults(): Promise<LabResult[]> {
    const res = await fetch(`${BASE_URL}/results`, { headers: authHeaders(), cache: "no-store" });
    return handleResponse<LabResult[]>(res);
}