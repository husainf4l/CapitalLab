export type NoteType = 'observation' | 'recommendation' | 'follow_up' | 'retest' | 'general';

export interface DoctorNote {
  id: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName?: string;
  type: NoteType;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateDoctorNoteRequest {
  patientId: string;
  type: NoteType;
  content: string;
}

export interface UpdateDoctorNoteRequest {
  type?: NoteType;
  content?: string;
}

export const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  observation: 'Observation',
  recommendation: 'Recommendation',
  follow_up: 'Follow Up',
  retest: 'Retest',
  general: 'General',
};
