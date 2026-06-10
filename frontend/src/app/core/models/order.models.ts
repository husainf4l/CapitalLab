export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'sample_collected'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface TestOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName?: string;
  appointmentId?: string;
  branchId?: string;
  branchName?: string;
  status: OrderStatus;
  tests: OrderTest[];
  totalAmount: number;
  isPaid: boolean;
  notes?: string;
  createdAt: string;
}

export interface OrderTest {
  testId: string;
  testName: string;
  testCode: string;
  price: number;
  sampleId?: string;
  status: string;
}
