export type FollowUpStatus = 'pending' | 'scheduled' | 'completed' | 'cancelled';

export interface FollowUp {
  id: string;
  patientId: string;
  patientName?: string;
  doctorId?: string;
  doctorName?: string;
  reason: string;
  scheduledDate: string;
  status: FollowUpStatus;
  notes?: string;
  completedAt?: string;
  createdAt: string;
}

export interface CreateFollowUpRequest {
  patientId: string;
  reason: string;
  scheduledDate: string;
  notes?: string;
}
