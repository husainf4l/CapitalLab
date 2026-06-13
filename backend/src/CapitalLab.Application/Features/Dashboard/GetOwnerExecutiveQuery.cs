using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Dashboard;
using CapitalLab.Domain.Entities.Organization;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.Dashboard;

public record GetOwnerExecutiveQuery(int DaysBack = 30) : IRequest<Result<OwnerExecutiveResponse>>;

public class GetOwnerExecutiveQueryHandler(
    IRepository<Branch> branchRepo,
    IRepository<Patient> patientRepo)
    : IRequestHandler<GetOwnerExecutiveQuery, Result<OwnerExecutiveResponse>>
{
    public async Task<Result<OwnerExecutiveResponse>> Handle(GetOwnerExecutiveQuery request, CancellationToken ct)
    {
        var activeBranches = await branchRepo.Query().CountAsync(b => b.IsActive, ct);
        var totalPatients = await patientRepo.Query().CountAsync(ct);

        return Result<OwnerExecutiveResponse>.Success(new OwnerExecutiveResponse(
            0m,
            0m,
            activeBranches,
            totalPatients,
            [],
            [],
            [],
            []));
    }
}
