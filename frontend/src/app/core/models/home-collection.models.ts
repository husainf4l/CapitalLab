export type HomeCollectionStatus =
  | 'requested'
  | 'assigned'
  | 'collected'
  | 'delivered'
  | 'cancelled';

export interface HomeCollectionRequest {
  id: string;
  patientId: string;
  patientName?: string;
  address: string;
  city: string;
  preferredDate: string;
  preferredTimeSlot: string;
  status: HomeCollectionStatus;
  assignedTechnicianId?: string;
  technicianName?: string;
  tests: HomeCollectionTest[];
  notes?: string;
  totalAmount: number;
  createdAt: string;
}

export interface HomeCollectionTest {
  testId: string;
  testName: string;
  price: number;
}

export interface CreateHomeCollectionRequest {
  patientId: string;
  address: string;
  city: string;
  preferredDate: string;
  preferredTimeSlot: string;
  testIds: string[];
  packageIds?: string[];
  notes?: string;
}
