using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Application.Common.Extensions;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.HomeCollections;
using ContractHomeCollectionStatus = CapitalLab.Contracts.Enums.HomeCollectionStatus;
using CapitalLab.Domain.Entities.Operations;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Interfaces;
using MediatR;

namespace CapitalLab.Application.Features.HomeCollections.Queries;

public record GetHomeCollectionRequestsQuery(PaginationRequest Pagination, HomeCollectionStatus? Status = null, Guid? AssignedStaffId = null) : IRequest<Result<PagedResult<HomeCollectionResponse>>>;
public record GetHomeCollectionByIdQuery(Guid Id) : IRequest<Result<HomeCollectionResponse>>;

public class GetHomeCollectionRequestsQueryHandler(IRepository<HomeCollectionRequest> repo)
    : IRequestHandler<GetHomeCollectionRequestsQuery, Result<PagedResult<HomeCollectionResponse>>>
{
    public async Task<Result<PagedResult<HomeCollectionResponse>>> Handle(GetHomeCollectionRequestsQuery request, CancellationToken cancellationToken)
    {
        var query = repo.Query();
        if (request.Status.HasValue) query = query.Where(h => h.Status == request.Status);
        if (request.AssignedStaffId.HasValue) query = query.Where(h => h.AssignedStaffId == request.AssignedStaffId);
        if (!string.IsNullOrWhiteSpace(request.Pagination.Search))
        {
            var s = request.Pagination.Search.ToLowerInvariant();
            query = query.Where(h => h.Address.ToLower().Contains(s) || (h.City != null && h.City.ToLower().Contains(s)));
        }
        query = request.Pagination.IsDescending ? query.OrderByDescending(h => h.PreferredDate) : query.OrderBy(h => h.PreferredDate);
        var paged = await query.ToPagedResultAsync(request.Pagination.WithClampedPageSize(), cancellationToken);
        return Result<PagedResult<HomeCollectionResponse>>.Success(paged.Map(ToResponse));
    }

    internal static HomeCollectionResponse ToResponse(HomeCollectionRequest h) =>
        new(h.Id, h.AppointmentId, h.PatientId, h.Address, h.City, h.Area, h.Latitude, h.Longitude, h.PreferredDate, h.PreferredTimeFrom, h.PreferredTimeTo, h.AssignedStaffId, (ContractHomeCollectionStatus)h.Status, h.CollectionNotes, h.AssignedAt, h.CollectedAt);
}

public class GetHomeCollectionByIdQueryHandler(IRepository<HomeCollectionRequest> repo)
    : IRequestHandler<GetHomeCollectionByIdQuery, Result<HomeCollectionResponse>>
{
    public async Task<Result<HomeCollectionResponse>> Handle(GetHomeCollectionByIdQuery request, CancellationToken cancellationToken)
    {
        var item = await repo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(HomeCollectionRequest), request.Id);
        return Result<HomeCollectionResponse>.Success(GetHomeCollectionRequestsQueryHandler.ToResponse(item));
    }
}
