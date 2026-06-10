export type CriticalResultLevel = 'critical_high' | 'critical_low';
export type CriticalResultStatus = 'unacknowledged' | 'acknowledged' | 'actioned';

export interface CriticalResult {
  id: string;
  resultId: string;
  sampleId?: string;
  orderId?: string;
  patientId: string;
  patientName?: string;
  testId?: string;
  testName: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  level: CriticalResultLevel;
  status: CriticalResultStatus;
  detectedAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  notes?: string;
}

export interface AcknowledgeCriticalRequest {
  notes?: string;
}
