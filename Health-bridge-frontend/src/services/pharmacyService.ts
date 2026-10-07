// src/services/pharmacyService.ts

import api from "@/lib/axios";
import type { Medicine, InventoryItem, Delivery } from "@/types/pharmacy";

// ============================================================
// Medicines
// ============================================================

export const getAllMedicines = () =>
    api.get<Medicine[]>("/v1/pharmacy/medicines");

export const searchMedicines = (name: string) =>
    api.get<Medicine[]>(`/v1/pharmacy/medicines?name=${encodeURIComponent(name)}`);

export const getMedicineById = (id: string) =>
    api.get<Medicine>(`/v1/pharmacy/medicines/${id}`);

export const createMedicine = (data: Omit<Medicine, "id">) =>
    api.post<Medicine>("/v1/pharmacy/medicines", data);

export const updateMedicine = (id: string, data: Partial<Omit<Medicine, "id">>) =>
    api.put<Medicine>(`/v1/pharmacy/medicines/${id}`, data);

export const deleteMedicine = (id: string) =>
    api.delete<void>(`/v1/pharmacy/medicines/${id}`);

// ============================================================
// Inventory
// ============================================================

export const getInventoryByPharmacy = (pharmacyId: string) =>
    api.get<InventoryItem[]>(`/v1/pharmacy/inventory/pharmacy/${pharmacyId}`);

export const getInventoryById = (id: string) =>
    api.get<InventoryItem>(`/v1/pharmacy/inventory/${id}`);

export const getLowStockAlerts = (pharmacyId: string) =>
    api.get<InventoryItem[]>(`/v1/pharmacy/inventory/alerts/low-stock?pharmacyId=${pharmacyId}`);

export const addStock = (data: Partial<InventoryItem>) =>
    api.post<InventoryItem>("/v1/pharmacy/inventory", data);

export const updateStock = (id: string, data: Partial<InventoryItem>) =>
    api.put<InventoryItem>(`/v1/pharmacy/inventory/${id}`, data);

export const deleteStock = (id: string) =>
    api.delete<void>(`/v1/pharmacy/inventory/${id}`);

// ============================================================
// Pharmacy branch
// ============================================================

export const getAllActivePharmacies = () =>
    api.get<unknown[]>("/v1/pharmacy/pharmacies");

export const getPharmacyById = (id: string) =>
    api.get<unknown>(`/v1/pharmacy/pharmacies/${id}`);

// ============================================================
// Deliveries & Orders
// ============================================================

export const getDeliveriesByPharmacy = (pharmacyId: string) =>
    api.get<Delivery[]>(`/v1/pharmacy/deliveries/pharmacy/${pharmacyId}`);

export const getDeliveryById = (id: string) =>
    api.get<Delivery>(`/v1/pharmacy/deliveries/${id}`);

export const updateDeliveryStatus = (id: string, status: string) =>
    api.patch<Delivery>(`/v1/pharmacy/deliveries/${id}/status`, { status });

export const createDelivery = (data: Partial<Delivery> & { items: unknown[] }) =>
    api.post<Delivery>("/v1/pharmacy/deliveries", data);

export const assignDeliveryRider = (
    deliveryId: string,
    riderData: { assignedRiderName: string; courierService?: string }
) =>
    api.patch<Delivery>(`/v1/pharmacy/deliveries/${deliveryId}/assign-rider`, riderData);

export const cancelDelivery = (deliveryId: string, reason?: string) =>
    api.patch<Delivery>(`/v1/pharmacy/deliveries/${deliveryId}/cancel`, { reason });

// ============================================================
// Prescriptions (Backend Integration for Pharmacy)
// ============================================================

export const getPharmacyPrescriptions = () =>
    api.get<Record<string, unknown>[]>("/prescriptions");

export const getPharmacyPrescriptionById = (id: string) =>
    api.get<Record<string, unknown>>(`/prescriptions/${id}`);