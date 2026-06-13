using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Dashboard;
using CapitalLab.Domain.Entities.Organization;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.Dashboard;

public record GetOwnerExecutiveSummaryQuery : IRequest<Result<OwnerExecutiveSummaryResponse>>;

public class GetOwnerExecutiveSummaryQueryHandler(
    IRepository<Branch> branchRepo,
    IRepository<Patient> patientRepo)
    : IRequestHandler<GetOwnerExecutiveSummaryQuery, Result<OwnerExecutiveSummaryResponse>>
{
    public async Task<Result<OwnerExecutiveSummaryResponse>> Handle(GetOwnerExecutiveSummaryQuery request, CancellationToken ct)
    {
        var activePatients = await patientRepo.Query().CountAsync(ct);

        var topBranch = await branchRepo.Query()
            .Where(b => b.IsActive)
            .Select(b => new { b.Id, b.Name })
            .FirstOrDefaultAsync(ct);

        return Result<OwnerExecutiveSummaryResponse>.Success(new OwnerExecutiveSummaryResponse(
            0m,
            0m,
            0m,
            activePatients,
            0,
            topBranch?.Name ?? string.Empty,
            0m));
    }
}
