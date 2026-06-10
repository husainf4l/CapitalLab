using CapitalLab.Contracts.Analytics;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Billing;
using CapitalLab.Domain.Entities.Insurance;
using CapitalLab.Domain.Entities.Inventory;
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
    IRepository<Invoice> invoiceRepo,
    IRepository<Payment> paymentRepo,
    IRepository<Patient> patientRepo,
    IRepository<TestOrder> orderRepo,
    IRepository<Appointment> appointmentRepo,
    IRepository<InventoryItem> inventoryRepo,
    IRepository<InsuranceClaim> claimRepo)
    : IRequestHandler<GetOwnerOverviewQuery, Result<OwnerOverviewResponse>>
{
    public async Task<Result<OwnerOverviewResponse>> Handle(GetOwnerOverviewQuery request, CancellationToken ct)
    {
        var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var totalRevenue = await invoiceRepo.Query().SumAsync(i => (decimal?)i.PaidAmount, ct) ?? 0m;
        var refunds = await paymentRepo.Query().Where(p => p.Status == PaymentStatus.Refunded).SumAsync(p => (decimal?)p.Amount, ct) ?? 0m;
        var outstanding = await invoiceRepo.Query()
            .Where(i => i.Status != InvoiceStatus.Cancelled && i.Status != InvoiceStatus.Refunded)
            .SumAsync(i => (decimal?)i.BalanceAmount, ct) ?? 0m;

        var totalPatients = await patientRepo.Query().CountAsync(ct);
        var newPatients = await patientRepo.Query().CountAsync(p => p.CreatedAt >= monthStart, ct);
        var totalTests = await orderRepo.Query().SumAsync(o => (int?)o.Items.Count, ct) ?? 0;
        var totalAppointments = await appointmentRepo.Query().CountAsync(ct);
        var lowStock = await inventoryRepo.Query().CountAsync(i => i.IsActive && i.CurrentStock <= i.MinimumStock, ct);
        var pendingClaims = await claimRepo.Query()
            .CountAsync(c => c.Status == InsuranceClaimStatus.Submitted || c.Status == InsuranceClaimStatus.UnderReview, ct);

        var response = new OwnerOverviewResponse(
            TotalRevenue: Math.Round(totalRevenue, 3),
            NetRevenue: Math.Round(totalRevenue - refunds, 3),
            OutstandingBalance: Math.Round(outstanding, 3),
            TotalPatients: totalPatients,
            NewPatients: newPatients,
            TotalTests: totalTests,
            TotalAppointments: totalAppointments,
            AverageTurnaroundHours: 0,
            LowStockItems: lowStock,
            PendingInsuranceClaims: pendingClaims);

        return Result<OwnerOverviewResponse>.Success(response);
    }
}

// ── Revenue ───────────────────────────────────────────────────────────────────
public record GetRevenueAnalyticsQuery(int Days = 30) : IRequest<Result<RevenueAnalyticsResponse>>;

public class GetRevenueAnalyticsQueryHandler(
    IRepository<Payment> paymentRepo,
    IRepository<Invoice> invoiceRepo,
    IRepository<Branch> branchRepo)
    : IRequestHandler<GetRevenueAnalyticsQuery, Result<RevenueAnalyticsResponse>>
{
    public async Task<Result<RevenueAnalyticsResponse>> Handle(GetRevenueAnalyticsQuery request, CancellationToken ct)
    {
        var since = DateTime.UtcNow.Date.AddDays(-(request.Days <= 0 ? 30 : request.Days));
        var payments = await paymentRepo.Query()
            .Where(p => p.Status == PaymentStatus.Completed && p.CreatedAt >= since)
            .Select(p => new { p.Amount, p.Method, p.BranchId, p.CreatedAt })
            .ToListAsync(ct);

        var daily = payments
            .GroupBy(p => DateOnly.FromDateTime(p.CreatedAt))
            .OrderBy(g => g.Key)
            .Select(g => new TimeSeriesPoint(g.Key.ToString("dd/MM"), Math.Round(g.Sum(x => x.Amount), 3)))
            .ToList();

        var monthly = payments
            .GroupBy(p => new { p.CreatedAt.Year, p.CreatedAt.Month })
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
            .Select(g => new TimeSeriesPoint($"{g.Key.Year}-{g.Key.Month:D2}", Math.Round(g.Sum(x => x.Amount), 3)))
            .ToList();

        var byMethod = payments
            .GroupBy(p => p.Method)
            .Select(g => new NamedAmount(g.Key.ToString(), Math.Round(g.Sum(x => x.Amount), 3), g.Count()))
            .OrderByDescending(x => x.Amount)
            .ToList();

        var branches = await branchRepo.Query().Select(b => new { b.Id, b.Name }).ToListAsync(ct);
        var byBranch = payments
            .GroupBy(p => p.BranchId)
            .Select(g => new NamedAmount(
                branches.FirstOrDefault(b => b.Id == g.Key)?.Name ?? "Unknown",
                Math.Round(g.Sum(x => x.Amount), 3), g.Count()))
            .OrderByDescending(x => x.Amount)
            .ToList();

        var refunds = await paymentRepo.Query()
            .Where(p => p.Status == PaymentStatus.Refunded && p.CreatedAt >= since)
            .SumAsync(p => (decimal?)p.Amount, ct) ?? 0m;

        var response = new RevenueAnalyticsResponse(
            DailyRevenue: daily,
            MonthlyRevenue: monthly,
            RevenueByBranch: byBranch,
            RevenueByTest: [],
            RevenueByPackage: [],
            PaymentMethodBreakdown: byMethod,
            TotalRefunds: Math.Round(refunds, 3));

        return Result<RevenueAnalyticsResponse>.Success(response);
    }
}

// ── Branches ──────────────────────────────────────────────────────────────────
public record GetBranchAnalyticsQuery : IRequest<Result<List<BranchPerformanceResponse>>>;

public class GetBranchAnalyticsQueryHandler(
    IRepository<Branch> branchRepo,
    IRepository<Invoice> invoiceRepo,
    IRepository<TestOrder> orderRepo,
    IRepository<Sample> sampleRepo)
    : IRequestHandler<GetBranchAnalyticsQuery, Result<List<BranchPerformanceResponse>>>
{
    public async Task<Result<List<BranchPerformanceResponse>>> Handle(GetBranchAnalyticsQuery request, CancellationToken ct)
    {
        var branches = await branchRepo.Query().Select(b => new { b.Id, b.Name }).ToListAsync(ct);
        var revenue = await invoiceRepo.Query()
            .GroupBy(i => i.BranchId)
            .Select(g => new { BranchId = g.Key, Amount = g.Sum(x => x.PaidAmount) })
            .ToListAsync(ct);
        var orders = await orderRepo.Query()
            .GroupBy(o => o.BranchId)
            .Select(g => new { BranchId = g.Key, Count = g.Count(), PatientCount = g.Select(x => x.PatientId).Distinct().Count() })
            .ToListAsync(ct);
        var pendingSamples = await sampleRepo.Query()
            .Where(s => s.Status != SampleStatus.Completed && s.Status != SampleStatus.Rejected)
            .GroupBy(s => s.BranchId)
            .Select(g => new { BranchId = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        var result = branches.Select(b => new BranchPerformanceResponse(
            b.Id, b.Name,
            Math.Round(revenue.FirstOrDefault(r => r.BranchId == b.Id)?.Amount ?? 0m, 3),
            orders.FirstOrDefault(o => o.BranchId == b.Id)?.PatientCount ?? 0,
            orders.FirstOrDefault(o => o.BranchId == b.Id)?.Count ?? 0,
            pendingSamples.FirstOrDefault(s => s.BranchId == b.Id)?.Count ?? 0,
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

// ── Inventory ─────────────────────────────────────────────────────────────────
public record GetInventoryAnalyticsQuery : IRequest<Result<InventoryAnalyticsResponse>>;

public class GetInventoryAnalyticsQueryHandler(
    IRepository<InventoryItem> itemRepo,
    IRepository<InventoryTransaction> txRepo)
    : IRequestHandler<GetInventoryAnalyticsQuery, Result<InventoryAnalyticsResponse>>
{
    public async Task<Result<InventoryAnalyticsResponse>> Handle(GetInventoryAnalyticsQuery request, CancellationToken ct)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var soon = today.AddDays(30);

        var lowStock = await itemRepo.Query().CountAsync(i => i.IsActive && i.CurrentStock <= i.MinimumStock, ct);
        var expiring = await itemRepo.Query().CountAsync(i => i.IsActive && i.ExpiryDate != null && i.ExpiryDate <= soon, ct);
        var items = await itemRepo.Query().Where(i => i.IsActive).Select(i => new { i.CurrentStock, i.CostPrice }).ToListAsync(ct);
        var value = Math.Round(items.Sum(i => i.CurrentStock * i.CostPrice), 3);

        var since = DateTime.UtcNow.AddDays(-30);
        var movements = await txRepo.Query().Where(t => t.CreatedAt >= since)
            .Select(t => new { t.CreatedAt, t.TotalCost }).ToListAsync(ct);
        var movement = movements
            .GroupBy(t => DateOnly.FromDateTime(t.CreatedAt))
            .OrderBy(g => g.Key)
            .Select(g => new TimeSeriesPoint(g.Key.ToString("dd/MM"), Math.Round(g.Sum(x => x.TotalCost), 3)))
            .ToList();

        return Result<InventoryAnalyticsResponse>.Success(
            new InventoryAnalyticsResponse(lowStock, expiring, value, movement));
    }
}

// ── Insurance ─────────────────────────────────────────────────────────────────
public record GetInsuranceAnalyticsQuery : IRequest<Result<InsuranceAnalyticsResponse>>;

public class GetInsuranceAnalyticsQueryHandler(IRepository<InsuranceClaim> claimRepo)
    : IRequestHandler<GetInsuranceAnalyticsQuery, Result<InsuranceAnalyticsResponse>>
{
    public async Task<Result<InsuranceAnalyticsResponse>> Handle(GetInsuranceAnalyticsQuery request, CancellationToken ct)
    {
        var claims = await claimRepo.Query()
            .Select(c => new { c.Status, c.ClaimAmount, c.ApprovedAmount })
            .ToListAsync(ct);

        var submitted = claims.Count(c => c.Status == InsuranceClaimStatus.Submitted || c.Status == InsuranceClaimStatus.UnderReview);
        var approved = claims.Count(c => c.Status == InsuranceClaimStatus.Approved || c.Status == InsuranceClaimStatus.PartiallyApproved);
        var rejected = claims.Count(c => c.Status == InsuranceClaimStatus.Rejected);
        var pendingAmount = Math.Round(claims
            .Where(c => c.Status == InsuranceClaimStatus.Submitted || c.Status == InsuranceClaimStatus.UnderReview)
            .Sum(c => c.ClaimAmount), 3);
        var approvedAmount = Math.Round(claims
            .Where(c => c.Status == InsuranceClaimStatus.Approved || c.Status == InsuranceClaimStatus.PartiallyApproved)
            .Sum(c => c.ApprovedAmount), 3);
        var paidAmount = Math.Round(claims.Where(c => c.Status == InsuranceClaimStatus.Paid).Sum(c => c.ApprovedAmount), 3);

        return Result<InsuranceAnalyticsResponse>.Success(
            new InsuranceAnalyticsResponse(submitted, approved, rejected, pendingAmount, approvedAmount, paidAmount));
    }
}
