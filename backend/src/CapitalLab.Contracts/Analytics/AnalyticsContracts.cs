namespace CapitalLab.Contracts.Analytics;

public record OwnerOverviewResponse(
    decimal TotalRevenue,
    decimal NetRevenue,
    decimal OutstandingBalance,
    int TotalPatients,
    int NewPatients,
    int TotalTests,
    int TotalAppointments,
    double AverageTurnaroundHours,
    int LowStockItems,
    int PendingInsuranceClaims);

public record TimeSeriesPoint(string Label, decimal Value);

public record RevenueAnalyticsResponse(
    List<TimeSeriesPoint> DailyRevenue,
    List<TimeSeriesPoint> MonthlyRevenue,
    List<NamedAmount> RevenueByBranch,
    List<NamedAmount> RevenueByTest,
    List<NamedAmount> RevenueByPackage,
    List<NamedAmount> PaymentMethodBreakdown,
    decimal TotalRefunds);

public record NamedAmount(string Name, decimal Amount, int Count);

public record BranchPerformanceResponse(
    Guid BranchId,
    string BranchName,
    decimal Revenue,
    int Patients,
    int Tests,
    int PendingSamples,
    double AverageTurnaroundHours);

public record TestAnalyticsResponse(
    List<NamedAmount> MostRequested,
    List<NamedAmount> MostProfitable,
    List<NamedAmount> PackagePerformance);

public record PatientAnalyticsResponse(
    int NewPatients,
    int ReturningPatients,
    int FamilyAccounts,
    List<TimeSeriesPoint> GrowthTrend);

public record InventoryAnalyticsResponse(
    int LowStockCount,
    int ExpiringSoonCount,
    decimal InventoryValue,
    List<TimeSeriesPoint> StockMovement);

public record InsuranceAnalyticsResponse(
    int SubmittedClaims,
    int ApprovedClaims,
    int RejectedClaims,
    decimal PendingAmount,
    decimal ApprovedAmount,
    decimal PaidAmount);
