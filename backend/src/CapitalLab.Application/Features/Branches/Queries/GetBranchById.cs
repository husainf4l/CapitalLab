using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Branches;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Organization;
using CapitalLab.Domain.Interfaces;
using Mapster;
using MediatR;

namespace CapitalLab.Application.Features.Branches.Queries;

public record GetBranchByIdQuery(Guid Id) : IRequest<Result<BranchResponse>>;

public class GetBranchByIdQueryHandler(IRepository<Branch> branches)
    : IRequestHandler<GetBranchByIdQuery, Result<BranchResponse>>
{
    public async Task<Result<BranchResponse>> Handle(
        GetBranchByIdQuery request,
        CancellationToken cancellationToken)
    {
        var branch = await branches.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Branch), request.Id);

        return Result<BranchResponse>.Success(branch.Adapt<BranchResponse>());
    }
}
