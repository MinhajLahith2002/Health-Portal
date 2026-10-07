"use client";

import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { useInvoices, useBillingItems } from "@/hooks/useBilling";
import { useInventory } from "@/hooks/useInventory";
import { useCompliance } from "@/hooks/useCompliance";
import {
  Invoice, InvoiceRequest, BillingItem, BillingItemRequest,
  HospitalInventory, HospitalInventoryRequest,
  ComplianceReport, ComplianceReportRequest,
} from "@/types/hospital";

interface HospitalContextType {
  invoices: Invoice[];
  invoicesLoading: boolean;
  invoicesError: string | null;
  fetchAllInvoices: () => Promise<void>;
  createInvoice: (data: InvoiceRequest) => Promise<Invoice>;
  updateInvoice: (id: string, data: InvoiceRequest) => Promise<Invoice>;
  deleteInvoice: (id: string) => Promise<void>;

  billingItems: BillingItem[];
  billingItemsLoading: boolean;
  billingItemsError: string | null;
  createBillingItem: (data: BillingItemRequest) => Promise<BillingItem>;
  updateBillingItem: (id: string, data: BillingItemRequest) => Promise<BillingItem>;
  deleteBillingItem: (id: string) => Promise<void>;

  inventory: HospitalInventory[];
  lowStockItems: HospitalInventory[];
  inventoryLoading: boolean;
  inventoryError: string | null;
  createInventoryItem: (data: HospitalInventoryRequest) => Promise<HospitalInventory>;
  updateInventoryItem: (id: string, data: HospitalInventoryRequest) => Promise<HospitalInventory>;
  deleteInventoryItem: (id: string) => Promise<void>;

  complianceReports: ComplianceReport[];
  complianceLoading: boolean;
  complianceError: string | null;
  createComplianceReport: (data: ComplianceReportRequest) => Promise<ComplianceReport>;
  updateComplianceReport: (id: string, data: ComplianceReportRequest) => Promise<ComplianceReport>;
  deleteComplianceReport: (id: string) => Promise<void>;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export const HospitalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const invoicesData = useInvoices();
  const billingItemsData = useBillingItems();
  const inventoryData = useInventory();
  const complianceData = useCompliance();

  const value = useMemo<HospitalContextType>(
    () => ({
      invoices: invoicesData.invoices || [],
      invoicesLoading: invoicesData.loading,
      invoicesError: invoicesData.error,
      fetchAllInvoices: invoicesData.fetchAllInvoices,
      createInvoice: invoicesData.createInvoice,
      updateInvoice: invoicesData.updateInvoice,
      deleteInvoice: invoicesData.deleteInvoice,

      billingItems: billingItemsData.items || [],
      billingItemsLoading: billingItemsData.loading,
      billingItemsError: billingItemsData.error,
      createBillingItem: billingItemsData.createItem,
      updateBillingItem: billingItemsData.updateItem,
      deleteBillingItem: billingItemsData.deleteItem,

      inventory: inventoryData.inventory || [],
      lowStockItems: inventoryData.lowStockItems || [],
      inventoryLoading: inventoryData.loading,
      inventoryError: inventoryData.error,
      createInventoryItem: inventoryData.createInventoryItem,
      updateInventoryItem: inventoryData.updateInventoryItem,
      deleteInventoryItem: inventoryData.deleteInventoryItem,

      complianceReports: complianceData.reports || [],
      complianceLoading: complianceData.loading,
      complianceError: complianceData.error,
      createComplianceReport: complianceData.createReport,
      updateComplianceReport: complianceData.updateReport,
      deleteComplianceReport: complianceData.deleteReport,
    }),
    [
      invoicesData.invoices, invoicesData.loading, invoicesData.error,
      invoicesData.fetchAllInvoices, invoicesData.createInvoice,
      invoicesData.updateInvoice, invoicesData.deleteInvoice,

      billingItemsData.items, billingItemsData.loading, billingItemsData.error,
      billingItemsData.createItem, billingItemsData.updateItem, billingItemsData.deleteItem,

      inventoryData.inventory, inventoryData.lowStockItems,
      inventoryData.loading, inventoryData.error,
      inventoryData.createInventoryItem, inventoryData.updateInventoryItem,
      inventoryData.deleteInventoryItem,

      complianceData.reports, complianceData.loading, complianceData.error,
      complianceData.createReport, complianceData.updateReport,
      complianceData.deleteReport,
    ]
  );

  return <HospitalContext.Provider value={value}>{children}</HospitalContext.Provider>;
};

export const useHospital = (): HospitalContextType => {
  const context = useContext(HospitalContext);
  if (context === undefined) {
    throw new Error("useHospital must be used within a HospitalProvider");
  }
  return context;
};