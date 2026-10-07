import { useState, useCallback, useEffect, useRef } from 'react';
import { invoiceService, billingItemService } from '@/services/billingService';
import { Invoice, InvoiceRequest, BillingItem, BillingItemRequest } from '@/types/hospital';

const TOKEN_KEY = "healthbridge_token";

const isLoginPage = () => {
  if (typeof window === 'undefined') return false;
  return window.location.pathname === '/login' || window.location.pathname === '/';
};

// ============================================================
// useInvoices
// ============================================================

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);
  const hasFetched = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAllInvoices = useCallback(async () => {
    console.log('🔄 fetchAllInvoices STARTED');

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || isLoginPage()) {
      console.log('⚠️ No token or login page');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await invoiceService.getAllInvoices();
      console.log('✅ Invoices fetched:', data?.length || 0);

      if (isMounted.current) {
        setInvoices(data || []);
        setLoading(false);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch invoices';
      console.error('❌ Error:', errorMessage);

      if (isMounted.current) {
        setError(errorMessage);
        setLoading(false);
      }
    }
  }, []);

  const createInvoice = useCallback(async (data: InvoiceRequest): Promise<Invoice> => {
    setLoading(true);
    setError(null);

    try {
      const newInvoice = await invoiceService.createInvoice(data);
      if (isMounted.current) {
        setInvoices((prev) => [...prev, newInvoice]);
      }
      return newInvoice;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create invoice';
      if (isMounted.current) setError(errorMessage);
      throw err;
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  const updateInvoice = useCallback(async (id: string, data: InvoiceRequest): Promise<Invoice> => {
    setLoading(true);
    setError(null);

    try {
      const updated = await invoiceService.updateInvoice(id, data);
      if (isMounted.current) {
        setInvoices((prev) => prev.map((inv) => (inv.id === id ? updated : inv)));
      }
      return updated;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update invoice';
      if (isMounted.current) setError(errorMessage);
      throw err;
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  const deleteInvoice = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await invoiceService.deleteInvoice(id);
      if (isMounted.current) {
        setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete invoice';
      if (isMounted.current) setError(errorMessage);
      throw err;
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  const getPatientInvoices = useCallback(async (patientId: string): Promise<Invoice[]> => {
    return await invoiceService.getPatientInvoices(patientId);
  }, []);

  // ✅ Single useEffect - uses timerRef for deferred setState
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    console.log('📋 useInvoices - Initial mount');

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || isLoginPage()) {
      // ✅ Use setTimeout to defer setState (React 19 compliant)
      timerRef.current = setTimeout(() => {
        if (isMounted.current) setLoading(false);
      }, 0);
      return;
    }

    // ✅ Call fetch in setTimeout to avoid synchronous setState in effect
    timerRef.current = setTimeout(() => {
      if (isMounted.current) fetchAllInvoices();
    }, 0);

    return () => {
      isMounted.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fetchAllInvoices]);

  return {
    invoices,
    loading,
    error,
    fetchAllInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getPatientInvoices,
  };
};

// ============================================================
// useBillingItems
// ============================================================

export const useBillingItems = () => {
  const [items, setItems] = useState<BillingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);
  const hasFetched = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAllItems = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || isLoginPage()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await billingItemService.getAllBillingItems();
      if (isMounted.current) {
        setItems(data || []);
        setLoading(false);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch billing items';
      if (isMounted.current) {
        setError(errorMessage);
        setLoading(false);
      }
    }
  }, []);

  const createItem = useCallback(async (data: BillingItemRequest): Promise<BillingItem> => {
    const newItem = await billingItemService.createBillingItem(data);
    setItems((prev) => [...prev, newItem]);
    return newItem;
  }, []);

  const updateItem = useCallback(async (id: string, data: BillingItemRequest): Promise<BillingItem> => {
    const updated = await billingItemService.updateBillingItem(id, data);
    setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
    return updated;
  }, []);

  const deleteItem = useCallback(async (id: string): Promise<void> => {
    await billingItemService.deleteBillingItem(id);
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const getInvoiceItems = useCallback(async (invoiceId: string): Promise<BillingItem[]> => {
    return await billingItemService.getInvoiceItems(invoiceId);
  }, []);

  // ✅ Single useEffect with setTimeout
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || isLoginPage()) {
      timerRef.current = setTimeout(() => {
        if (isMounted.current) setLoading(false);
      }, 0);
      return;
    }

    timerRef.current = setTimeout(() => {
      if (isMounted.current) fetchAllItems();
    }, 0);

    return () => {
      isMounted.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fetchAllItems]);

  return {
    items,
    loading,
    error,
    fetchAllItems,
    createItem,
    updateItem,
    deleteItem,
    getInvoiceItems,
  };
};