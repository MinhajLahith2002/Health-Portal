import { useState, useEffect, useCallback } from 'react';
import { inventoryService } from '@/services/inventoryService';
import {
  HospitalInventory,
  HospitalInventoryRequest,
} from '@/types/hospital';

const TOKEN_KEY = 'healthbridge_token';

const isLoginPage = () => {
  if (typeof window === 'undefined') return false;

  return (
    window.location.pathname === '/login' ||
    window.location.pathname === '/'
  );
};

export const useInventory = () => {
  const [inventory, setInventory] = useState<HospitalInventory[]>([]);
  const [lowStockItems, setLowStockItems] = useState<HospitalInventory[]>([]);
  const [loading, setLoading] = useState(() => {
    if (typeof window === 'undefined') return true;

    return !isLoginPage() && !!localStorage.getItem(TOKEN_KEY);
  });
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // Fetch All Inventory
  // ============================================================

  const fetchAllInventory = useCallback(async () => {
    if (isLoginPage()) {
      return;
    }

    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      console.warn('⚠️ No authentication token found');
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Fetching inventory...');

      setLoading(true);
      setError(null);

      const data = await inventoryService.getAllInventory();

      console.log('✅ Inventory received:', data);

      setInventory(data || []);
    } catch (err: unknown) {
      console.error('❌ Inventory fetch error:', err);

      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to fetch inventory';

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // Fetch Low Stock Items
  // ============================================================

  const fetchLowStock = useCallback(async () => {
    if (isLoginPage()) {
      return;
    }

    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      return;
    }

    try {
      console.log('🔄 Fetching low stock items...');

      const data = await inventoryService.getLowStockItems();

      console.log('✅ Low stock items received:', data);

      setLowStockItems(data || []);
    } catch (err: unknown) {
      console.error('❌ Low stock fetch error:', err);

      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to fetch low stock items';

      setError(errorMessage);
    }
  }, []);

  // ============================================================
  // Initial Load
  // ============================================================

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isLoginPage()) {
      return;
    }

    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      console.warn('⚠️ No token found');
      return;
    }

    const loadInventory = async () => {
      console.log('🚀 Loading inventory data...');

      try {
        await Promise.all([
          fetchAllInventory(),
          fetchLowStock(),
        ]);

        console.log('✅ Inventory initialization completed');
      } catch (error) {
        console.error(
          '❌ Inventory initialization error:',
          error
        );
      }
    };

    loadInventory();
  }, [fetchAllInventory, fetchLowStock]);

  // ============================================================
  // Create
  // ============================================================

  const createInventoryItem = useCallback(
    async (
      data: HospitalInventoryRequest
    ): Promise<HospitalInventory> => {
      try {
        setLoading(true);
        setError(null);

        const newItem =
          await inventoryService.createInventory(data);

        setInventory((prev) => [...prev, newItem]);

        return newItem;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to create inventory item';

        setError(errorMessage);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ============================================================
  // Update
  // ============================================================

  const updateInventoryItem = useCallback(
    async (
      id: string,
      data: HospitalInventoryRequest
    ): Promise<HospitalInventory> => {
      try {
        setLoading(true);
        setError(null);

        const updated =
          await inventoryService.updateInventory(id, data);

        setInventory((prev) =>
          prev.map((item) =>
            item.id === id ? updated : item
          )
        );

        return updated;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to update inventory item';

        setError(errorMessage);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ============================================================
  // Delete
  // ============================================================

  const deleteInventoryItem = useCallback(
    async (id: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        await inventoryService.deleteInventory(id);

        setInventory((prev) =>
          prev.filter((item) => item.id !== id)
        );
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to delete inventory item';

        setError(errorMessage);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ============================================================
  // Get Hospital Inventory
  // ============================================================

  const getHospitalInventory = useCallback(
    async (
      hospitalId: string
    ): Promise<HospitalInventory[]> => {
      try {
        setLoading(true);
        setError(null);

        return await inventoryService.getHospitalInventory(
          hospitalId
        );
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to fetch hospital inventory';

        setError(errorMessage);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    inventory,
    lowStockItems,
    loading,
    error,

    fetchAllInventory,
    fetchLowStock,

    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,

    getHospitalInventory,
  };
};