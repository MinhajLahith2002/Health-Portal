export interface ApiError {
  field?: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  statusCode?: number;
  timestamp?: string;
  errors?: ApiError[];
}
