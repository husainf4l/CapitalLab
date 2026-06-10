using CapitalLab.Application.Common.Extensions;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Patients;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Interfaces;
using MediatR;

namespace CapitalLab.Application.Features.Patients.Queries;

public record GetPatientsQuery(
    PaginationRequest Pagination,
    bool? IsActive = null,
    Gender? Gender = null) : IRequest<Result<PagedResult<PatientSummaryResponse>>>;

public class GetPatientsQueryHandler(IRepository<Patient> patientRepo)
    : IRequestHandler<GetPatientsQuery, Result<PagedResult<PatientSummaryResponse>>>
{
    public async Task<Result<PagedResult<PatientSummaryResponse>>> Handle(
        GetPatientsQuery request, CancellationToken cancellationToken)
    {
        var query = patientRepo.Query();

        if (request.IsActive.HasValue)
            query = query.Where(p => p.IsActive == request.IsActive.Value);

        if (request.Gender.HasValue)
            query = query.Where(p => p.Gender == request.Gender.Value);

        if (!string.IsNullOrWhiteSpace(request.Pagination.Search))
        {
            var search = request.Pagination.Search.ToLowerInvariant();
            query = query.Where(p =>
                p.PatientNumber.ToLower().Contains(search) ||
                p.FirstName.ToLower().Contains(search) ||
                p.LastName.ToLower().Contains(search) ||
                p.Phone.Contains(search));
        }

        query = request.Pagination.SortBy?.ToLowerInvariant() switch
        {
            "number" => request.Pagination.IsDescending
                ? query.OrderByDescending(p => p.PatientNumber)
                : query.OrderBy(p => p.PatientNumber),
            "dob" => request.Pagination.IsDescending
                ? query.OrderByDescending(p => p.DateOfBirth)
                : query.OrderBy(p => p.DateOfBirth),
            _ => request.Pagination.IsDescending
                ? query.OrderByDescending(p => p.LastName)
                : query.OrderBy(p => p.LastName)
        };

        var paged = await query
            .Select(p => new PatientSummaryResponse(
                p.Id, p.PatientNumber,
                p.FirstName + " " + p.LastName,
                (Contracts.Enums.Gender)p.Gender, p.DateOfBirth,
                0, // Age cannot be computed in SQL
                p.Phone, p.IsActive))
            .ToPagedResultAsync(request.Pagination, cancellationToken);

        return Result<PagedResult<PatientSummaryResponse>>.Success(paged);
    }
}
