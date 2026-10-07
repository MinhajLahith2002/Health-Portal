// src/services/prescriptionBillingService.ts
import { getAllMedicines } from "@/services/pharmacyService";
import type { Prescription, PrescriptionItem } from "@/types/prescription";
import type { Medicine } from "@/types/pharmacy";

export interface DispensedMedicationItem {
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface DispensedPrescriptionBill {
  id: string; // prescription ID
  prescriptionNumber: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  doctorId?: string;
  doctorName?: string;
  dispensedAt: string;
  items: DispensedMedicationItem[];
  totalAmount: number;
  status: "DISPENSED" | "PAID";
  paidAt?: string;
  paymentId?: string;
}

const STORAGE_KEY = "healthbridge_dispensed_prescriptions";
const DISPENSE_EVENT = "healthbridge_prescription_dispensed";

export const prescriptionBillingService = {
  /**
   * Builds a structured bill object from a prescription and matches medicine prices
   */
  buildBill(prescription: Prescription, medicines: Medicine[]): DispensedPrescriptionBill {
    const items: DispensedMedicationItem[] = (prescription.items || []).map((item) => {
      const med = medicines.find(
        (m) =>
          (m.id && item.medicineId && m.id === item.medicineId) ||
          (m.medicineCode && item.medicineId && m.medicineCode === item.medicineId) ||
          (m.name && item.medicineName && m.name.trim().toLowerCase() === item.medicineName.trim().toLowerCase())
      );

      const rawPrice = med?.unitPrice !== undefined ? Number(med.unitPrice) : 0;
      // Default to 150 if price in catalog is 0 or unlisted, to ensure realistic billing
      const unitPrice = rawPrice > 0 ? rawPrice : 150;
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const totalPrice = unitPrice * quantity;

      return {
        medicineId: item.medicineId || med?.id || "",
        medicineName: item.medicineName || "Prescribed Medicine",
        dosage: item.dosage || "As directed",
        frequency: item.frequency || "Daily",
        duration: item.duration || "7 Days",
        quantity,
        unitPrice,
        totalPrice,
      };
    });

    const totalAmount = items.reduce((sum, it) => sum + it.totalPrice, 0);

    return {
      id: prescription.id,
      prescriptionNumber: prescription.prescriptionNumber || `RX-${prescription.id.slice(-6).toUpperCase()}`,
      patientId: prescription.patientId,
      patientName: prescription.patientName,
      patientPhone: prescription.patientPhone,
      doctorId: prescription.doctorId,
      doctorName: prescription.doctorName,
      dispensedAt: new Date().toISOString(),
      items,
      totalAmount,
      status: "DISPENSED",
    };
  },

  /**
   * Persists a dispensed prescription bill to localStorage and fires a sync event
   */
  saveDispensedBill(bill: DispensedPrescriptionBill): void {
    if (typeof window === "undefined") return;
    try {
      const existing = this.getAllDispensedBills();
      const filtered = existing.filter((b) => b.id !== bill.id);
      filtered.unshift(bill);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      window.dispatchEvent(new CustomEvent(DISPENSE_EVENT, { detail: bill }));
    } catch (e) {
      console.error("Failed to save dispensed prescription bill:", e);
    }
  },

  /**
   * Reads all stored dispensed prescription bills
   */
  getAllDispensedBills(): DispensedPrescriptionBill[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data) as DispensedPrescriptionBill[];
    } catch {
      return [];
    }
  },

  /**
   * Gets dispensed prescription bills for a specific patient (matching ID or Name)
   */
  getDispensedBillsForPatient(patientId?: string, patientName?: string): DispensedPrescriptionBill[] {
    const all = this.getAllDispensedBills();
    if (!patientId && !patientName) return all;

    const cleanId = (patientId || "").trim().toLowerCase();
    const cleanName = (patientName || "").trim().toLowerCase();

    return all.filter((b) => {
      const billPid = (b.patientId || "").trim().toLowerCase();
      const billPName = (b.patientName || "").trim().toLowerCase();

      const idMatch = cleanId && billPid && (billPid === cleanId || cleanId.includes(billPid) || billPid.includes(cleanId));
      const nameMatch = cleanName && billPName && (billPName === cleanName || cleanName.includes(billPName) || billPName.includes(cleanName));

      return idMatch || nameMatch;
    });
  },

  /**
   * Mark a prescription bill as paid
   */
  markAsPaid(prescriptionId: string, paymentId?: string): void {
    if (typeof window === "undefined") return;
    try {
      const all = this.getAllDispensedBills();
      const updated = all.map((b) => {
        if (b.id === prescriptionId || b.prescriptionNumber === prescriptionId) {
          return {
            ...b,
            status: "PAID" as const,
            paidAt: new Date().toISOString(),
            paymentId,
          };
        }
        return b;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(DISPENSE_EVENT));
    } catch (e) {
      console.error("Failed to mark bill as paid:", e);
    }
  },
};
