export interface Medicine {
    id: string;
    medicineCode: string;
    name: string;
    genericName?: string;
    brand?: string;
    manufacturer?: string;
    category?: string;
    dosageForm?: string;
    strength?: string;
    controlledDrug: boolean;
    prescriptionRequired: boolean;
    unitPrice: number;
}

export interface InventoryItem {
    id: string;
    itemCode: string;
    itemName: string;
    category?: string;
    quantity: number;
    minimumStock: number;
    unit?: string;
    unitCost?: number;
    expiryDate?: string;
    pharmacyId: string;
    medicineId: string;
    batchNumber: string;
    supplierName?: string;
    sellingPrice?: number;
    status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "EXPIRED";
}

export interface Delivery {
    id: string;
    deliveryCode: string;
    orderCode?: string;
    pharmacyId: string;
    patientId: string;
    items?: { medicineId: string; medicineName: string; quantity: number }[];
    deliveryAddress: string;
    status: string;
    assignedRiderName?: string;
    fulfillmentType?: "PICKUP" | "DELIVERY";
    actionRequired?: boolean;
    courierService?: string;
}