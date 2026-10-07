export type PaymentStatus = "Paid" | "Pending";

export interface Payment {
  id: string;
  patientName: string;
  date: string;
  service: string;
  amount: number;
  status: PaymentStatus;
}

export interface MonthlyRevenue {
  month: string;
  amount: number;
}

export interface Earnings {
  totalEarnings: number;
  monthlyEarnings: number;
  consultationIncome: number;
  pendingAmount: number;
  revenue: MonthlyRevenue[];
  payments: Payment[];
}
