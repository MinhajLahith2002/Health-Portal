export interface Prescription {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  
  // ✅ Backend එකෙන් එන්නේ Uppercase නිසා මේක වෙනස් කළා
  status: "ACTIVE" | "COMPLETED" | "CANCELLED"; 
  
  items: PrescriptionItem[];
  notes?: string;
  diagnosis?: string;
  validUntil: string;
  
  // ✅ අඩුවෙලා තිබුණු fields එකතු කළා
  qrCodeData?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PrescriptionItem {
  id?: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions: string;
}

export interface CreatePrescriptionDTO {
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  items: PrescriptionItem[];
  notes?: string;
  diagnosis?: string;
  validDays: number;
}