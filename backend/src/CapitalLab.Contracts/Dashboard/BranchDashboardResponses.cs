namespace CapitalLab.Contracts.Dashboard;

public record BranchKpiResponse(
    Guid BranchId,
    string BranchName,
    decimal TotalRevenue,
    int TotalSamples,
    int TotalReports,
    int TotalAppointments,
    int LowStockAlerts,
    int StaffCount,
    int PendingResults);

public record DailyMetricPoint(string Date, decimal Value);

public record BranchDashboardResponse(
    BranchKpiResponse Kpis,
    List<DailyMetricPoint> DailyRevenue,
    List<DailyMetricPoint> DailySamples,
    List<DailyMetricPoint> TurnaroundTimes);

public record OwnerExecutiveResponse(
    decimal TotalRevenue,
    decimal RevenueGrowthPct,
    int ActiveBranches,
    int TotalPatients,
    List<BranchRankingItem> TopBranches,
    List<TopTestItem> TopTests,
    List<TopTestItem> TopPackages,
    List<DailyMetricPoint> RevenueForecast);

public record BranchRankingItem(Guid BranchId, string BranchName, decimal Revenue, int Samples, double Score);
public record TopTestItem(Guid Id, string Name, int Count, decimal Revenue);

public record OwnerExecutiveSummaryResponse(
    decimal RevenueToday,
    decimal RevenueThisMonth,
    decimal RevenueYtd,
    int ActivePatients,
    int TestsThisMonth,
    string TopBranchName,
    decimal TopBranchRevenue);
