using CapitalLab.Contracts.Analytics;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Laboratory;
using CapitalLab.Domain.Entities.Operations;
using CapitalLab.Domain.Entities.Organization;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.Analytics.Queries;

// ── Overview ──────────────────────────────────────────────────────────────────
public record GetOwnerOverviewQuery : IRequest<Result<OwnerOverviewResponse>>;

public class GetOwnerOverviewQueryHandler(
    IRepository<Patient> patientRepo,
    IRepository<TestOrder> orderRepo,
    IRepository<Appointment> appointmentRepo)
    : IRequestHandler<GetOwnerOverviewQuery, Result<OwnerOverviewResponse>>
{
    public async Task<Result<OwnerOverviewResponse>> Handle(GetOwnerOverviewQuery request, CancellationToken ct)
    {
        var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var totalPatients = await patientRepo.Query().CountAsync(ct);
        var newPatients = await patientRepo.Query().CountAsync(p => p.CreatedAt >= monthStart, ct);
        var totalTests = await orderRepo.Query().SumAsync(o => (int?)o.Items.Count, ct) ?? 0;
        var totalAppointments = await appointmentRepo.Query().CountAsync(ct);

        var response = new OwnerOverviewResponse(
            TotalRevenue: 0,
            NetRevenue: 0,
            OutstandingBalance: 0,
            TotalPatients: totalPatients,
            NewPatients: newPatients,
            TotalTests: totalTests,
            TotalAppointments: totalAppointments,
            AverageTurnaroundHours: 0,
            LowStockItems: 0,
            PendingInsuranceClaims: 0);

        return Result<OwnerOverviewResponse>.Success(response);
    }
}

// ── Revenue ───────────────────────────────────────────────────────────────────
public record GetRevenueAnalyticsQuery(int Days = 30) : IRequest<Result<RevenueAnalyticsResponse>>;

public class GetRevenueAnalyticsQueryHandler(IRepository<TestOrder> orderRepo)
    : IRequestHandler<GetRevenueAnalyticsQuery, Result<RevenueAnalyticsResponse>>
{
    public async Task<Result<RevenueAnalyticsResponse>> Handle(GetRevenueAnalyticsQuery request, CancellationToken ct)
    {
        var since = DateTime.UtcNow.Date.AddDays(-(request.Days <= 0 ? 30 : request.Days));

        var orders = await orderRepo.Query()
            .Where(o => o.CreatedAt >= since)
            .Select(o => new { o.CreatedAt, o.TotalAmount })
            .ToListAsync(ct);

        var daily = orders
            .GroupBy(o => DateOnly.FromDateTime(o.CreatedAt))
            .OrderBy(g => g.Key)
            .Select(g => new TimeSeriesPoint(g.Key.ToString("dd/MM"), Math.Round(g.Sum(x => x.TotalAmount), 3)))
            .ToList();

        var response = new RevenueAnalyticsResponse(
            DailyRevenue: daily,
            MonthlyRevenue: [],
            RevenueByBranch: [],
            RevenueByTest: [],
            RevenueByPackage: [],
            PaymentMethodBreakdown: [],
            TotalRefunds: 0);

        return Result<RevenueAnalyticsResponse>.Success(response);
    }
}

// ── Branches ──────────────────────────────────────────────────────────────────
public record GetBranchAnalyticsQuery : IRequest<Result<List<BranchPerformanceResponse>>>;

public class GetBranchAnalyticsQueryHandler(
    IRepository<Branch> branchRepo,
    IRepository<TestOrder> orderRepo)
    : IRequestHandler<GetBranchAnalyticsQuery, Result<List<BranchPerformanceResponse>>>
{
    public async Task<Result<List<BranchPerformanceResponse>>> Handle(GetBranchAnalyticsQuery request, CancellationToken ct)
    {
        var branches = await branchRepo.Query().Select(b => new { b.Id, b.Name }).ToListAsync(ct);
        var orders = await orderRepo.Query()
            .GroupBy(o => o.BranchId)
            .Select(g => new { BranchId = g.Key, Count = g.Count(), PatientCount = g.Select(x => x.PatientId).Distinct().Count() })
            .ToListAsync(ct);

        var result = branches.Select(b => new BranchPerformanceResponse(
            b.Id, b.Name,
            0m,
            orders.FirstOrDefault(o => o.BranchId == b.Id)?.PatientCount ?? 0,
            orders.FirstOrDefault(o => o.BranchId == b.Id)?.Count ?? 0,
            0,
            0)).ToList();

        return Result<List<BranchPerformanceResponse>>.Success(result);
    }
}

// ── Tests ─────────────────────────────────────────────────────────────────────
public record GetTestAnalyticsQuery : IRequest<Result<TestAnalyticsResponse>>;

public class GetTestAnalyticsQueryHandler(IRepository<TestOrderItem> itemRepo)
    : IRequestHandler<GetTestAnalyticsQuery, Result<TestAnalyticsResponse>>
{
    public async Task<Result<TestAnalyticsResponse>> Handle(GetTestAnalyticsQuery request, CancellationToken ct)
    {
        var items = await itemRepo.Query()
            .Select(i => new { i.NameSnapshot, i.ItemType, i.TotalPrice })
            .ToListAsync(ct);

        var mostRequested = items
            .GroupBy(i => i.NameSnapshot)
            .Select(g => new NamedAmount(g.Key, Math.Round(g.Sum(x => x.TotalPrice), 3), g.Count()))
            .OrderByDescending(x => x.Count).Take(10).ToList();

        var mostProfitable = items
            .GroupBy(i => i.NameSnapshot)
            .Select(g => new NamedAmount(g.Key, Math.Round(g.Sum(x => x.TotalPrice), 3), g.Count()))
            .OrderByDescending(x => x.Amount).Take(10).ToList();

        var packages = items
            .Where(i => i.ItemType == OrderItemType.HealthPackage)
            .GroupBy(i => i.NameSnapshot)
            .Select(g => new NamedAmount(g.Key, Math.Round(g.Sum(x => x.TotalPrice), 3), g.Count()))
            .OrderByDescending(x => x.Count).Take(10).ToList();

        return Result<TestAnalyticsResponse>.Success(new TestAnalyticsResponse(mostRequested, mostProfitable, packages));
    }
}

// ── Patients ──────────────────────────────────────────────────────────────────
public record GetPatientAnalyticsQuery : IRequest<Result<PatientAnalyticsResponse>>;

public class GetPatientAnalyticsQueryHandler(
    IRepository<Patient> patientRepo,
    IRepository<TestOrder> orderRepo)
    : IRequestHandler<GetPatientAnalyticsQuery, Result<PatientAnalyticsResponse>>
{
    public async Task<Result<PatientAnalyticsResponse>> Handle(GetPatientAnalyticsQuery request, CancellationToken ct)
    {
        var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var newPatients = await patientRepo.Query().CountAsync(p => p.CreatedAt >= monthStart, ct);
        var familyAccounts = await patientRepo.Query().CountAsync(p => p.FamilyMembers.Any(), ct);

        var orderPatients = await orderRepo.Query()
            .GroupBy(o => o.PatientId)
            .Select(g => new { PatientId = g.Key, Count = g.Count() })
            .ToListAsync(ct);
        var returning = orderPatients.Count(x => x.Count > 1);

        var growth = await patientRepo.Query()
            .Where(p => p.CreatedAt >= DateTime.UtcNow.AddMonths(-6))
            .Select(p => p.CreatedAt)
            .ToListAsync(ct);
        var growthTrend = growth
            .GroupBy(d => new { d.Year, d.Month })
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
            .Select(g => new TimeSeriesPoint($"{g.Key.Year}-{g.Key.Month:D2}", g.Count()))
            .ToList();

        return Result<PatientAnalyticsResponse>.Success(
            new PatientAnalyticsResponse(newPatients, returning, familyAccounts, growthTrend));
    }
}

// ── Inventory (stub — module removed) ────────────────────────────────────────
public record GetInventoryAnalyticsQuery : IRequest<Result<InventoryAnalyticsResponse>>;

public class GetInventoryAnalyticsQueryHandler
    : IRequestHandler<GetInventoryAnalyticsQuery, Result<InventoryAnalyticsResponse>>
{
    public Task<Result<InventoryAnalyticsResponse>> Handle(GetInventoryAnalyticsQuery request, CancellationToken ct)
        => Task.FromResult(Result<InventoryAnalyticsResponse>.Success(
            new InventoryAnalyticsResponse(0, 0, 0, [])));
}

// ── Insurance (stub — module removed) ────────────────────────────────────────
public record GetInsuranceAnalyticsQuery : IRequest<Result<InsuranceAnalyticsResponse>>;

public class GetInsuranceAnalyticsQueryHandler
    : IRequestHandler<GetInsuranceAnalyticsQuery, Result<InsuranceAnalyticsResponse>>
{
    public Task<Result<InsuranceAnalyticsResponse>> Handle(GetInsuranceAnalyticsQuery request, CancellationToken ct)
        => Task.FromResult(Result<InsuranceAnalyticsResponse>.Success(
            new InsuranceAnalyticsResponse(0, 0, 0, 0, 0, 0)));
}
