import type { AuthUser } from "@/lib/auth";

export type { AuthUser };
export type UserRole = AuthUser["role"];

export interface AuthResponseData {
  token: string;
  id: string;
  fullName: string;
  email: string;
  role: AuthUser["role"];
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
}

export interface PageResponse<T> {
  content: T[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isEmpty: boolean;
}
