using CapitalLab.Application.Common.Extensions;
using CapitalLab.Contracts.Staff;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Interfaces;
using MediatR;

namespace CapitalLab.Application.Features.Staff.Queries;

public record GetStaffListQuery(
    PaginationRequest Pagination,
    Guid? BranchId = null,
    bool? IsActive = null) : IRequest<Result<PagedResult<StaffSummaryResponse>>>;

public class GetStaffListQueryHandler(IRepository<StaffProfile> staffRepo)
    : IRequestHandler<GetStaffListQuery, Result<PagedResult<StaffSummaryResponse>>>
{
    public async Task<Result<PagedResult<StaffSummaryResponse>>> Handle(
        GetStaffListQuery request, CancellationToken cancellationToken)
    {
        var query = staffRepo.Query();

        if (request.BranchId.HasValue)
            query = query.Where(s => s.BranchId == request.BranchId.Value);

        if (request.IsActive.HasValue)
            query = query.Where(s => s.IsActive == request.IsActive.Value);

        if (!string.IsNullOrWhiteSpace(request.Pagination.Search))
        {
            var search = request.Pagination.Search.ToLowerInvariant();
            query = query.Where(s =>
                s.FullName.ToLower().Contains(search) ||
                s.EmployeeCode.ToLower().Contains(search) ||
                (s.JobTitle != null && s.JobTitle.ToLower().Contains(search)));
        }

        query = request.Pagination.SortBy?.ToLowerInvariant() switch
        {
            "code" => request.Pagination.IsDescending
                ? query.OrderByDescending(s => s.EmployeeCode)
                : query.OrderBy(s => s.EmployeeCode),
            _ => request.Pagination.IsDescending
                ? query.OrderByDescending(s => s.FullName)
                : query.OrderBy(s => s.FullName)
        };

        var paged = await query.Select(s => new StaffSummaryResponse(
            s.Id, s.EmployeeCode, s.FullName, s.JobTitle, s.Department, s.IsActive))
            .ToPagedResultAsync(request.Pagination, cancellationToken);

        return Result<PagedResult<StaffSummaryResponse>>.Success(paged);
    }
}
