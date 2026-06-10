export type ResultStatus = 'pending' | 'partial' | 'completed' | 'reviewed' | 'released';

export interface TestResult {
  id: string;
  orderId: string;
  testId: string;
  testName: string;
  testCode: string;
  patientId: string;
  patientName?: string;
  sampleId: string;
  value?: string;
  unit?: string;
  referenceRange?: string;
  interpretation?: 'normal' | 'high' | 'low' | 'critical';
  status: ResultStatus;
  performedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
}

export interface Report {
  id: string;
  reportNumber: string;
  orderId: string;
  patientId: string;
  patientName?: string;
  results: TestResult[];
  status: ResultStatus;
  generatedAt?: string;
  releasedAt?: string;
  pdfUrl?: string;
  isDownloadable: boolean;
}
