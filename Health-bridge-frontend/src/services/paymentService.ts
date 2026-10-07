import { apiClient } from './apiClient';

export interface PaymentRequestData {
  patientId: string;
  description: string;
  category: string;
  amount: number;
  cardHolderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

export interface InitiatePaymentResponse {
  message: string;
  paymentId: string;
  maskedCard: string;
  amount: number;
  status: string;
  emailSent?: boolean;
  devOtp?: string;
}

export interface ConfirmPaymentResponse {
  message: string;
  paymentId: string;
  status: string;
  confirmedAt: string;
  amount: number;
}

export interface PaymentRecord {
  id: string;
  patientId: string;
  patientEmail: string;
  patientName: string;
  description: string;
  category: string;
  amount: number;
  cardHolderName: string;
  maskedCardNumber: string;
  status: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';
  createdAt: string;
  confirmedAt?: string;
}

export const paymentService = {
  /**
   * Step 1: Initiate payment and trigger 6-digit confirmation code via email
   */
  initiatePayment: async (data: PaymentRequestData): Promise<InitiatePaymentResponse> => {
    return apiClient.post<InitiatePaymentResponse>('/payments/initiate', data);
  },

  /**
   * Step 2: Confirm payment using 6-digit code received via email
   */
  confirmPayment: async (paymentId: string, confirmationCode: string): Promise<ConfirmPaymentResponse> => {
    return apiClient.post<ConfirmPaymentResponse>(`/payments/${paymentId}/confirm`, {
      confirmationCode,
    });
  },

  /**
   * Get all payments for a specific patient
   */
  getPaymentsByPatient: async (patientId: string): Promise<PaymentRecord[]> => {
    return apiClient.get<PaymentRecord[]>(`/payments/patient/${patientId}`);
  },

  /**
   * Get single payment by ID
   */
  getPaymentById: async (id: string): Promise<PaymentRecord> => {
    return apiClient.get<PaymentRecord>(`/payments/${id}`);
  },
};
