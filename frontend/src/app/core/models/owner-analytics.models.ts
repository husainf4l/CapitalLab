export interface OwnerOverview {
  totalRevenue: number;
  netRevenue: number;
  outstandingBalance: number;
  totalPatients: number;
  newPatients: number;
  totalTests: number;
  totalAppointments: number;
  averageTurnaroundHours: number;
  lowStockItems: number;
  pendingInsuranceClaims: number;
}

export interface TimeSeriesPoint {
  label: string;
  value: number;
}

export interface NamedAmount {
  name: string;
  amount: number;
  count: number;
}

export interface RevenueAnalytics {
  dailyRevenue: TimeSeriesPoint[];
  monthlyRevenue: TimeSeriesPoint[];
  revenueByBranch: NamedAmount[];
  revenueByTest: NamedAmount[];
  revenueByPackage: NamedAmount[];
  paymentMethodBreakdown: NamedAmount[];
  totalRefunds: number;
}

export interface BranchPerformance {
  branchId: string;
  branchName: string;
  revenue: number;
  patients: number;
  tests: number;
  pendingSamples: number;
  averageTurnaroundHours: number;
}

export interface TestAnalytics {
  mostRequested: NamedAmount[];
  mostProfitable: NamedAmount[];
  packagePerformance: NamedAmount[];
}

export interface PatientAnalytics {
  newPatients: number;
  returningPatients: number;
  familyAccounts: number;
  growthTrend: TimeSeriesPoint[];
}

export interface InventoryAnalytics {
  lowStockCount: number;
  expiringSoonCount: number;
  inventoryValue: number;
  stockMovement: TimeSeriesPoint[];
}

export interface InsuranceAnalytics {
  submittedClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  pendingAmount: number;
  approvedAmount: number;
  paidAmount: number;
}
