import { useSyncExternalStore } from 'react';
import { invoiceService } from '@/services/billingService';
import { Invoice } from '@/types/hospital';

type Listener = () => void;

let invoices: Invoice[] = [];
let loading = true;
let error: string | null = null;
let listeners: Listener[] = [];
let initialized = false;

// ✅ Subscribe function
const subscribe = (listener: Listener) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
};

// ✅ Get snapshot
const getSnapshot = () => ({ invoices, loading, error });

// ✅ Fetch data once
const fetchData = async () => {
  if (initialized) return;
  initialized = true;

  try {
    const data = await invoiceService.getAllInvoices();
    invoices = data;
    loading = false;
    listeners.forEach(l => l());
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to fetch';
    loading = false;
    listeners.forEach(l => l());
  }
};

// ✅ Initialize
if (typeof window !== 'undefined') {
  fetchData();
}

export const useBillingStore = () => {
  return useSyncExternalStore(subscribe, getSnapshot);
};