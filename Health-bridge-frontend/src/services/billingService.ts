import { apiClient } from './apiClient';
import {
  Invoice,
  InvoiceRequest,
  BillingItem,
  BillingItemRequest,
} from '@/types/hospital';

export const invoiceService = {
  createInvoice: async (data: InvoiceRequest): Promise<Invoice> => {
    return apiClient.post<Invoice>('/hospital-billing/invoices', data);
  },

  getAllInvoices: async (): Promise<Invoice[]> => {
    return apiClient.get<Invoice[]>('/hospital-billing/invoices');
  },

  getInvoiceById: async (id: string): Promise<Invoice> => {
    return apiClient.get<Invoice>(`/hospital-billing/invoices/${id}`);
  },

  getPatientInvoices: async (patientId: string): Promise<Invoice[]> => {
    return apiClient.get<Invoice[]>(`/hospital-billing/invoices/patient/${patientId}`);
  },

  updateInvoice: async (id: string, data: InvoiceRequest): Promise<Invoice> => {
    return apiClient.put<Invoice>(`/hospital-billing/invoices/${id}`, data);
  },

  deleteInvoice: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/hospital-billing/invoices/${id}`);
  },
};

export const billingItemService = {
  createBillingItem: async (data: BillingItemRequest): Promise<BillingItem> => {
    return apiClient.post<BillingItem>('/hospital-billing/items', data);
  },

  getAllBillingItems: async (): Promise<BillingItem[]> => {
    return apiClient.get<BillingItem[]>('/hospital-billing/items');
  },

  getBillingItemById: async (id: string): Promise<BillingItem> => {
    return apiClient.get<BillingItem>(`/hospital-billing/items/${id}`);
  },

  getInvoiceItems: async (invoiceId: string): Promise<BillingItem[]> => {
    return apiClient.get<BillingItem[]>(`/hospital-billing/items/invoice/${invoiceId}`);
  },

  updateBillingItem: async (id: string, data: BillingItemRequest): Promise<BillingItem> => {
    return apiClient.put<BillingItem>(`/hospital-billing/items/${id}`, data);
  },

  deleteBillingItem: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/hospital-billing/items/${id}`);
  },
};