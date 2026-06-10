using CapitalLab.Application.Common.Extensions;
using CapitalLab.Contracts.Catalog;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Catalog;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Interfaces;
using MediatR;

namespace CapitalLab.Application.Features.LabTests.Queries;

public record GetLabTestsQuery(
    PaginationRequest Pagination,
    Guid? CategoryId = null,
    SampleType? SampleType = null,
    bool? IsActive = null,
    bool? IsFastingRequired = null,
    bool? IsHomeCollectionAvailable = null) : IRequest<Result<PagedResult<LabTestSummaryResponse>>>;

public class GetLabTestsQueryHandler(
    IRepository<LabTest> labTestRepo,
    IRepository<TestCategory> categoryRepo)
    : IRequestHandler<GetLabTestsQuery, Result<PagedResult<LabTestSummaryResponse>>>
{
    public async Task<Result<PagedResult<LabTestSummaryResponse>>> Handle(
        GetLabTestsQuery request, CancellationToken cancellationToken)
    {
        var query = labTestRepo.Query();

        if (request.CategoryId.HasValue)
            query = query.Where(t => t.CategoryId == request.CategoryId.Value);
        if (request.SampleType.HasValue)
            query = query.Where(t => t.SampleType == request.SampleType.Value);
        if (request.IsActive.HasValue)
            query = query.Where(t => t.IsActive == request.IsActive.Value);
        if (request.IsFastingRequired.HasValue)
            query = query.Where(t => t.IsFastingRequired == request.IsFastingRequired.Value);
        if (request.IsHomeCollectionAvailable.HasValue)
            query = query.Where(t => t.IsHomeCollectionAvailable == request.IsHomeCollectionAvailable.Value);

        if (!string.IsNullOrWhiteSpace(request.Pagination.Search))
        {
            var search = request.Pagination.Search.ToLowerInvariant();
            query = query.Where(t =>
                t.Name.ToLower().Contains(search) ||
                t.Code.ToLower().Contains(search));
        }

        var joinedQuery = query.Join(
            categoryRepo.Query(),
            t => t.CategoryId,
            c => c.Id,
            (t, c) => new LabTestSummaryResponse(
                t.Id, t.Code, t.Name, t.NameAr, c.Name,
                (Contracts.Enums.SampleType)t.SampleType, t.Price, t.Currency, t.IsActive));

        var paged = await joinedQuery.ToPagedResultAsync(request.Pagination, cancellationToken);

        return Result<PagedResult<LabTestSummaryResponse>>.Success(paged);
    }
}
