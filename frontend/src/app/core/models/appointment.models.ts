export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'cancelled'
  | 'completed'
  | 'no_show';

export type AppointmentType = 'branch' | 'home_collection';

export interface Appointment {
  id: string;
  patientId: string;
  patientName?: string;
  branchId?: string;
  branchName?: string;
  doctorId?: string;
  doctorName?: string;
  appointmentDate: string;
  appointmentTime: string;
  status: AppointmentStatus;
  type: AppointmentType;
  tests?: AppointmentTest[];
  notes?: string;
  createdAt: string;
}

export interface AppointmentTest {
  testId: string;
  testName: string;
  price: number;
}

export interface CreateAppointmentRequest {
  patientId: string;
  branchId?: string;
  appointmentDate: string;
  appointmentTime: string;
  type: AppointmentType;
  testIds: string[];
  packageIds?: string[];
  notes?: string;
}
