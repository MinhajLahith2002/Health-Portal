export type PolicyStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'SUSPENDED';
export type ClaimStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PAID';

export interface InsurancePolicy {
  id: string;
  policyNumber: string;
  patientId: string;
  providerName: string;
  policyType: string;
  coverageAmount: number;
  coverageUsed: number;
  coverageRemaining?: number;
  startDate: string;
  endDate: string;
  status: PolicyStatus;
}

export interface InsuranceClaim {
  id: string;
  claimNumber: string;
  policyId: string;
  policyNumber?: string;
  providerName?: string;
  patientId: string;
  treatmentDescription: string;
  hospitalName?: string;
  branch?: string;
  claimAmount: number;
  approvedAmount?: number;
  documentUrls?: string[];
  documentFileIds?: string[];
  status: ClaimStatus;
  reviewedByOfficerId?: string;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface ClaimDecisionRequest {
  approve: boolean;
  approvedAmount?: number;
  rejectionReason?: string;
}

export interface MonthlyTrendItem {
  month: string;
  year: number;
  claimCount: number;
  approvedCount: number;
  totalRequested: number;
  totalApproved: number;
}

export interface ProviderSummaryItem {
  providerName: string;
  policyCount: number;
  claimCount: number;
  totalCoverage: number;
  totalClaimed: number;
  totalApproved: number;
}

export interface InsuranceReportSummary {
  startDate?: string;
  endDate?: string;
  totalClaims: number;
  approvedClaims: number;
  pendingClaims: number;
  rejectedClaims: number;
  paidClaims: number;
  totalClaimAmount: number;
  totalApprovedAmount: number;
  totalRejectedAmount: number;
  totalPendingAmount: number;
  approvalRate: number;
  rejectionRate: number;
  averageProcessingTimeHours: number;
  totalPolicies: number;
  activePolicies: number;
  totalCoverageIssued: number;
  totalCoverageUsed: number;
  totalCoverageRemaining: number;
  policyUtilizationRate: number;
  statusCounts: Record<string, number>;
  statusAmounts: Record<string, number>;
  monthlyTrends: MonthlyTrendItem[];
  providerSummaries: ProviderSummaryItem[];
  claims: InsuranceClaim[];
}