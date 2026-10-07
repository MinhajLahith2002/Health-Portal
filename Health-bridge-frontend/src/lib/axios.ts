import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { clearAuthData } from "@/lib/auth";

const TOKEN_KEY = "healthbridge_token";
const USER_KEY = "healthbridge_user";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
    || process.env.NEXT_PUBLIC_API_URL
    || 'http://localhost:8088/api';

export function isMissingDoctorSessionsEndpoint(error: unknown): boolean {
    return axios.isAxiosError(error)
        && error.config?.method?.toLowerCase() === 'get'
        && error.config?.url === '/doctor-sessions/mine'
        && (error.response?.status === 404
            || (error.response?.status === 500
                && typeof error.response.data?.message === 'string'
                && error.response.data.message.startsWith('No static resource api/doctor-sessions/mine')));
}

interface ApiErrorPayload {
    message?: string;
    errors?: Record<string, string> | Array<{ message?: string }>;
}

// ============================================================
// ERROR MESSAGE EXTRACTOR
// ============================================================

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
    if (axios.isAxiosError<ApiErrorPayload>(error)) {
        const payload = error.response?.data;
        if (payload?.message) {
            if (payload.message.toLowerCase().includes("operation successful")) {
                return "Operation unsuccessful";
            }
            return payload.message;
        }
        if (payload?.errors && !Array.isArray(payload.errors)) {
            const firstError = Object.values(payload.errors)[0];
            if (firstError) return firstError;
        }
        if (Array.isArray(payload?.errors) && payload.errors[0]?.message) {
            return payload.errors[0].message;
        }
    }

    return error instanceof Error ? error.message : fallback;
}

// ============================================================
// API CLIENT
// ============================================================

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        console.log('📡 Initializing API Client with baseURL:', API_BASE_URL);

        this.client = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });

        // ============================================================
        // REQUEST INTERCEPTOR
        // ============================================================
        this.client.interceptors.request.use(
            (config) => {
                const token = typeof window !== 'undefined'
                    ? localStorage.getItem(TOKEN_KEY)
                    : null;

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                    console.log('🔑 Token added to request');
                } else if (typeof window !== 'undefined') {
                    console.warn('⚠️ No token found');
                }

                console.log(`🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
                return config;
            },
            (error) => {
                console.error('❌ Request Error:', error);
                return Promise.reject(error);
            }
        );

        // ============================================================
        // RESPONSE INTERCEPTOR
        // ============================================================
        this.client.interceptors.response.use(
            (response) => {
                console.log(`✅ ${response.status} ${response.config.url}`);
                const payload = response.data;

                // Unwrap nested data payload if success is true
                if (
                    payload &&
                    typeof payload === "object" &&
                    payload.success === true &&
                    Object.prototype.hasOwnProperty.call(payload, "data")
                ) {
                    response.data = payload.data;
                }
                return response;
            },
            (error) => {
                const status = error.response?.status;
                if (isMissingDoctorSessionsEndpoint(error)) {
                    return Promise.reject(error);
                }
                const url = error.config?.url;
                const method = error.config?.method?.toUpperCase();

                // ============================================================
                // 500 - Internal Server Error
                // ============================================================
                if (status === 500) {
                    // ✅ Silent handling for optional endpoints
                    const silentEndpoints = [
                        '/hospitals',
                        '/doctors',
                        '/users?role=PATIENT',
                    ];

                    const isSilent = silentEndpoints.some((ep) =>
                        url?.includes(ep)
                    );

                    if (!isSilent) {
                        console.error(`💥 500 Server Error: ${method} ${url}`);
                        console.error('   Response:', error.response?.data);
                    }
                }

                // ============================================================
                // 404 - Not Found
                // ============================================================
                else if (status === 404) {
                    console.warn(`🔍 404 Not Found: ${method} ${url}`);

                    // ✅ Silent for optional endpoints
                    const silentEndpoints = [
                        '/hospitals',
                        '/doctors',
                        '/users?role=PATIENT',
                    ];

                    const isSilent = silentEndpoints.some((ep) =>
                        url?.includes(ep)
                    );

                    if (isSilent) {
                        console.warn(`   ⚠️ Endpoint missing: ${url}`);
                    }
                }

                // ============================================================
                // 401 - Unauthorized
                // ============================================================
                else if (status === 401) {
                    console.error(`🔐 401 Unauthorized: ${method} ${url}`);

                    if (typeof window !== 'undefined') {
                        const isLoginPage = window.location.pathname === "/login";
                        if (!isLoginPage) {
                            clearAuthData();
                            window.location.href = '/login';
                        }
                    }
                }

                // ============================================================
                // 403 - Forbidden
                // ============================================================
                else if (status === 403) {
                    console.error(`🚫 403 Forbidden: ${method} ${url}`);
                }

                // ============================================================
                // Network Error
                // ============================================================
                else if (error.code === 'ERR_NETWORK') {
                    console.error(`🌐 Network Error: ${method} ${url} - Backend not reachable`);
                    console.error(`   Check if backend is running at: ${API_BASE_URL}`);
                }

                // ============================================================
                // Timeout
                // ============================================================
                else if (error.code === 'ECONNABORTED') {
                    console.error(`⏰ Timeout: ${method} ${url} - Request took too long`);
                }

                // ============================================================
                // Other Errors
                // ============================================================
                else {
                    console.error(`❌ Response Error: ${method} ${url}`);
                    console.error('   Status:', status);
                    console.error('   Message:', error.message);
                }

                return Promise.reject(error);
            }
        );
    }

    // ============================================================
    // HTTP METHODS
    // ============================================================

    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.get(url, config);
        return response.data;
    }

    public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.post(url, data, config);
        return response.data;
    }

    public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.put(url, data, config);
        return response.data;
    }

    public async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.patch(url, data, config);
        return response.data;
    }

    public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.delete(url, config);
        return response.data;
    }
}

// ============================================================
// EXPORT
// ============================================================

const api = new ApiClient();
export default api;
