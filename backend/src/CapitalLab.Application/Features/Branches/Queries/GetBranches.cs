using CapitalLab.Application.Common.Extensions;
using CapitalLab.Contracts.Branches;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Organization;
using CapitalLab.Domain.Interfaces;
using Mapster;
using MediatR;

namespace CapitalLab.Application.Features.Branches.Queries;

public record GetBranchesQuery(
    PaginationRequest Pagination,
    bool? IsActive = null) : IRequest<Result<PagedResult<BranchSummaryResponse>>>;

public class GetBranchesQueryHandler(IRepository<Branch> branches)
    : IRequestHandler<GetBranchesQuery, Result<PagedResult<BranchSummaryResponse>>>
{
    public async Task<Result<PagedResult<BranchSummaryResponse>>> Handle(
        GetBranchesQuery request,
        CancellationToken cancellationToken)
    {
        var query = branches.Query();

        if (request.IsActive.HasValue)
            query = query.Where(b => b.IsActive == request.IsActive.Value);

        if (!string.IsNullOrWhiteSpace(request.Pagination.Search))
        {
            var search = request.Pagination.Search.ToLowerInvariant();
            query = query.Where(b =>
                b.Name.ToLower().Contains(search) ||
                b.Code.ToLower().Contains(search) ||
                (b.City != null && b.City.ToLower().Contains(search)));
        }

        query = request.Pagination.SortBy?.ToLowerInvariant() switch
        {
            "code" => request.Pagination.IsDescending ? query.OrderByDescending(b => b.Code) : query.OrderBy(b => b.Code),
            "city" => request.Pagination.IsDescending ? query.OrderByDescending(b => b.City) : query.OrderBy(b => b.City),
            _ => request.Pagination.IsDescending ? query.OrderByDescending(b => b.Name) : query.OrderBy(b => b.Name)
        };

        var paged = await query.ToPagedResultAsync(request.Pagination, cancellationToken);

        return Result<PagedResult<BranchSummaryResponse>>.Success(
            paged.Map(b => b.Adapt<BranchSummaryResponse>()));
    }
}
