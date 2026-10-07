import { apiClient } from "@/services/apiClient";
import { AuthUser, clearAuthData, saveAuthData } from "@/lib/auth";

const TOKEN_KEY = "healthbridge_token";
const USER_KEY = "healthbridge_user";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword?: string;
  branch?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface AuthResponseData {
  token: string;
  id: string;
  fullName: string;
  email: string;
  role: AuthUser["role"];
  message: string;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponseData> {
    const response = await apiClient.post<AuthResponseData>("/auth/register", payload);
    
    if (response.token) {
      saveAuthData(response.token, {
        id: response.id,
        fullName: response.fullName,
        email: response.email,
        role: response.role,
      });
    }
    
    return response;
  },

  async login(payload: LoginPayload): Promise<AuthResponseData> {
    console.log('🔐 Logging in:', payload.email);
    const response = await apiClient.post<AuthResponseData>("/auth/login", payload);
    console.log('✅ Login response received');
    
    if (response.token) {
      saveAuthData(response.token, {
        id: response.id,
        fullName: response.fullName,
        email: response.email,
        role: response.role,
      });
      console.log('🔑 Token saved successfully');
      console.log('👤 User:', response.fullName);
    }
    
    return response;
  },

  async forgotPassword(email: string): Promise<{ message: string; devOtp?: string; emailSent?: boolean }> {
    const response = await apiClient.post<{ message: string; devOtp?: string; emailSent?: boolean }>("/auth/forgot-password", { email });
    return response;
  },

  async verifyOtp(payload: VerifyOtpPayload): Promise<{ valid: boolean; message: string }> {
    const response = await apiClient.post<{ valid: boolean; message: string }>("/auth/verify-otp", payload);
    return response;
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<AuthResponseData> {
    const response = await apiClient.post<AuthResponseData>("/auth/reset-password", payload);
    
    if (response.token) {
      saveAuthData(response.token, {
        id: response.id,
        fullName: response.fullName,
        email: response.email,
        role: response.role,
      });
      console.log('✅ Auth data saved after password reset');
    }
    
    return response;
  },

  async googleAuth(token: string, email?: string, name?: string): Promise<AuthResponseData> {
    console.log('🌐 Authenticating with Google token');
    const response = await apiClient.post<AuthResponseData>("/auth/google", {
      token,
      email,
      name,
    });
    console.log('✅ Google auth response received');
    
    if (response.token) {
      saveAuthData(response.token, {
        id: response.id,
        fullName: response.fullName,
        email: response.email,
        role: response.role,
      });
      console.log('🔑 Token saved successfully');
      console.log('👤 User:', response.fullName);
    }
    
    return response;
  },

  // ✅ Helper methods
  logout(): void {
    clearAuthData();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  getUser(): AuthUser | null {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(USER_KEY);
      if (data) {
        try {
          return JSON.parse(data);
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};