export type InsuranceClaimStatus =
  | 'Draft' | 'Submitted' | 'UnderReview' | 'Approved' | 'PartiallyApproved' | 'Rejected' | 'Paid';

export interface InsuranceProvider {
  id: string;
  name: string;
  code: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  isActive: boolean;
  createdAt: string;
}

export interface InsuranceClaim {
  id: string;
  claimNumber: string;
  patientId: string;
  invoiceId: string;
  providerId: string;
  claimAmount: number;
  approvedAmount: number;
  rejectedAmount: number;
  status: InsuranceClaimStatus;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  paidAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface CreateInsuranceProviderRequest {
  name: string;
  code: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
}
