using CapitalLab.Application.Common.Extensions;
using CapitalLab.Contracts.Catalog;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Catalog;
using CapitalLab.Domain.Interfaces;
using MediatR;

namespace CapitalLab.Application.Features.TestCategories.Queries;

public record GetTestCategoriesQuery(
    PaginationRequest Pagination,
    bool? IsActive = null) : IRequest<Result<PagedResult<TestCategorySummaryResponse>>>;

public class GetTestCategoriesQueryHandler(IRepository<TestCategory> categoryRepo)
    : IRequestHandler<GetTestCategoriesQuery, Result<PagedResult<TestCategorySummaryResponse>>>
{
    public async Task<Result<PagedResult<TestCategorySummaryResponse>>> Handle(
        GetTestCategoriesQuery request, CancellationToken cancellationToken)
    {
        var query = categoryRepo.Query();

        if (request.IsActive.HasValue)
            query = query.Where(c => c.IsActive == request.IsActive.Value);

        if (!string.IsNullOrWhiteSpace(request.Pagination.Search))
        {
            var search = request.Pagination.Search.ToLowerInvariant();
            query = query.Where(c =>
                c.Name.ToLower().Contains(search) ||
                c.Code.ToLower().Contains(search));
        }

        query = request.Pagination.IsDescending
            ? query.OrderByDescending(c => c.SortOrder)
            : query.OrderBy(c => c.SortOrder);

        var paged = await query
            .Select(c => new TestCategorySummaryResponse(
                c.Id, c.Code, c.Name, c.NameAr, c.SortOrder, c.IsActive))
            .ToPagedResultAsync(request.Pagination, cancellationToken);

        return Result<PagedResult<TestCategorySummaryResponse>>.Success(paged);
    }
}
