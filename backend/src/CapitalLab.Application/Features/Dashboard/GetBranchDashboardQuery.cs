using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Dashboard;
using CapitalLab.Domain.Entities.Laboratory;
using CapitalLab.Domain.Entities.Operations;
using CapitalLab.Domain.Entities.Organization;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.Dashboard;

public record GetBranchDashboardQuery(Guid BranchId, int DaysBack = 30) : IRequest<Result<BranchDashboardResponse>>;

public class GetBranchDashboardQueryHandler(
    IRepository<Branch> branchRepo,
    IRepository<Report> reportRepo,
    IRepository<Appointment> appointmentRepo,
    IRepository<StaffProfile> staffRepo)
    : IRequestHandler<GetBranchDashboardQuery, Result<BranchDashboardResponse>>
{
    public async Task<Result<BranchDashboardResponse>> Handle(GetBranchDashboardQuery request, CancellationToken ct)
    {
        var branch = await branchRepo.GetByIdAsync(request.BranchId, ct);
        if (branch is null)
            return Result<BranchDashboardResponse>.Failure("NOT_FOUND", "Branch not found.");

        var reports = await reportRepo.Query().CountAsync(ct);

        var appointments = await appointmentRepo.Query()
            .Where(a => a.BranchId == request.BranchId)
            .CountAsync(ct);

        var staffCount = await staffRepo.Query()
            .Where(s => s.BranchId == request.BranchId && s.IsActive)
            .CountAsync(ct);

        var kpis = new BranchKpiResponse(
            request.BranchId, branch.Name,
            0m, 0, reports, appointments, 0, staffCount, 0);

        return Result<BranchDashboardResponse>.Success(new BranchDashboardResponse(kpis, [], [], []));
    }
}
