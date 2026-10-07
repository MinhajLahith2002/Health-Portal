export type EquipmentStatus = 'In Use' | 'Available' | 'Maintenance' | 'Calibration Due' | 'Decommissioned';

export interface EquipmentAsset {
  id: string;
  assetId: string;
  name: string;
  category: string;
  department: string;
  location: string;
  serialNo: string;
  status: EquipmentStatus;
  calibrationDueDate: string;
  model?: string;
  supplier?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  depreciationPercentage?: number;
  initialValue?: number;
  currentValue?: number;
  alertMessage?: string;
  branchId?: string;
  branchCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EquipmentOverviewStats {
  totalInventory: number;
  operationalRate: number;
  underMaintenance: number;
  calibrationDue: number;
}
