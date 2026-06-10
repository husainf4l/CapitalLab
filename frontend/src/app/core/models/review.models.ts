export type ReviewStatus = 'pending' | 'approved' | 'retest_requested' | 'rejected';

export interface DoctorReview {
  id: string;
  reportId: string;
  orderId?: string;
  patientId: string;
  patientName?: string;
  doctorId?: string;
  doctorName?: string;
  status: ReviewStatus;
  notes?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface CreateReviewRequest {
  reportId: string;
  notes?: string;
}

export interface ReviewDecisionRequest {
  notes?: string;
}
