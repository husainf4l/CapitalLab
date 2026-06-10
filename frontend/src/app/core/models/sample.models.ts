export type SampleStatus =
  | 'pending_collection'
  | 'collected'
  | 'received'
  | 'processing'
  | 'qc_pending'
  | 'qc_passed'
  | 'qc_failed'
  | 'results_pending'
  | 'completed'
  | 'stored'
  | 'disposed';

export interface Sample {
  id: string;
  sampleNumber?: string;
  barcode: string;
  qrCode?: string;
  orderId: string;
  testId: string;
  testName?: string;
  testCode?: string;
  patientId: string;
  patientName?: string;
  branchId?: string;
  branchName?: string;
  sampleType: string;
  collectedAt?: string;
  collectedBy?: string;
  receivedAt?: string;
  processingStartedAt?: string;
  processingCompletedAt?: string;
  qcNotes?: string;
  qcBy?: string;
  status: SampleStatus;
  notes?: string;
}

export interface CreateSampleRequest {
  orderId: string;
  testId: string;
  patientId: string;
  sampleType: string;
  notes?: string;
}

export interface QualityCheckRequest {
  status: 'passed' | 'failed' | 'recollect_required';
  notes?: string;
}

export interface BarcodeResponse {
  barcode: string;
  qrCode?: string;
  barcodeImageUrl?: string;
  qrImageUrl?: string;
}
