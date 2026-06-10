using CapitalLab.Application.Common.Extensions;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Doctors;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Interfaces;
using MediatR;

namespace CapitalLab.Application.Features.Doctors.Queries;

public record GetDoctorsQuery(
    PaginationRequest Pagination,
    Guid? BranchId = null,
    bool? IsActive = null,
    bool? IsReviewer = null,
    bool? IsApprover = null) : IRequest<Result<PagedResult<DoctorSummaryResponse>>>;

public class GetDoctorsQueryHandler(IRepository<Doctor> doctorRepo)
    : IRequestHandler<GetDoctorsQuery, Result<PagedResult<DoctorSummaryResponse>>>
{
    public async Task<Result<PagedResult<DoctorSummaryResponse>>> Handle(
        GetDoctorsQuery request, CancellationToken cancellationToken)
    {
        var query = doctorRepo.Query();

        if (request.BranchId.HasValue)
            query = query.Where(d => d.BranchId == request.BranchId.Value);
        if (request.IsActive.HasValue)
            query = query.Where(d => d.IsActive == request.IsActive.Value);
        if (request.IsReviewer.HasValue)
            query = query.Where(d => d.IsReviewer == request.IsReviewer.Value);
        if (request.IsApprover.HasValue)
            query = query.Where(d => d.IsApprover == request.IsApprover.Value);

        if (!string.IsNullOrWhiteSpace(request.Pagination.Search))
        {
            var search = request.Pagination.Search.ToLowerInvariant();
            query = query.Where(d =>
                d.FullName.ToLower().Contains(search) ||
                d.LicenseNumber.ToLower().Contains(search) ||
                (d.Specialization != null && d.Specialization.ToLower().Contains(search)));
        }

        query = request.Pagination.IsDescending
            ? query.OrderByDescending(d => d.FullName)
            : query.OrderBy(d => d.FullName);

        var paged = await query
            .Select(d => new DoctorSummaryResponse(
                d.Id, d.FullName, d.Specialization, d.LicenseNumber,
                d.IsReviewer, d.IsApprover, d.IsActive))
            .ToPagedResultAsync(request.Pagination, cancellationToken);

        return Result<PagedResult<DoctorSummaryResponse>>.Success(paged);
    }
}
