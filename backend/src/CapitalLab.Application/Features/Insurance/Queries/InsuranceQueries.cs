using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Insurance;
using CapitalLab.Domain.Entities.Insurance;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.Insurance.Queries;

public record GetProvidersQuery(bool? ActiveOnly) : IRequest<Result<List<InsuranceProviderResponse>>>;

public class GetProvidersQueryHandler(IRepository<InsuranceProvider> repo)
    : IRequestHandler<GetProvidersQuery, Result<List<InsuranceProviderResponse>>>
{
    public async Task<Result<List<InsuranceProviderResponse>>> Handle(GetProvidersQuery request, CancellationToken ct)
    {
        var query = repo.Query();
        if (request.ActiveOnly == true) query = query.Where(p => p.IsActive);
        var list = await query.OrderBy(p => p.Name).ToListAsync(ct);
        return Result<List<InsuranceProviderResponse>>.Success(list.Select(p => p.ToResponse()).ToList());
    }
}

public record GetClaimsQuery(PaginationRequest Pagination, Guid? ProviderId, Guid? PatientId, Domain.Enums.InsuranceClaimStatus? Status)
    : IRequest<Result<PagedResult<InsuranceClaimResponse>>>;

public class GetClaimsQueryHandler(IRepository<InsuranceClaim> repo)
    : IRequestHandler<GetClaimsQuery, Result<PagedResult<InsuranceClaimResponse>>>
{
    public async Task<Result<PagedResult<InsuranceClaimResponse>>> Handle(GetClaimsQuery request, CancellationToken ct)
    {
        var query = repo.Query();
        if (request.ProviderId.HasValue) query = query.Where(c => c.ProviderId == request.ProviderId);
        if (request.PatientId.HasValue) query = query.Where(c => c.PatientId == request.PatientId);
        if (request.Status.HasValue) query = query.Where(c => c.Status == request.Status);
        if (!string.IsNullOrWhiteSpace(request.Pagination.Search))
        {
            var s = request.Pagination.Search.ToLower();
            query = query.Where(c => c.ClaimNumber.ToLower().Contains(s));
        }
        query = query.OrderByDescending(c => c.CreatedAt);

        var totalCount = await query.CountAsync(ct);
        var items = await query.Skip(request.Pagination.Skip).Take(request.Pagination.PageSize).ToListAsync(ct);
        return Result<PagedResult<InsuranceClaimResponse>>.Success(new PagedResult<InsuranceClaimResponse>
        {
            Items = items.Select(c => c.ToResponse()).ToList(),
            TotalCount = totalCount,
            Page = request.Pagination.Page,
            PageSize = request.Pagination.PageSize
        });
    }
}

public record GetClaimByIdQuery(Guid Id) : IRequest<Result<InsuranceClaimResponse>>;

public class GetClaimByIdQueryHandler(IRepository<InsuranceClaim> repo)
    : IRequestHandler<GetClaimByIdQuery, Result<InsuranceClaimResponse>>
{
    public async Task<Result<InsuranceClaimResponse>> Handle(GetClaimByIdQuery request, CancellationToken ct)
    {
        var claim = await repo.GetByIdAsync(request.Id, ct) ?? throw new NotFoundException(nameof(InsuranceClaim), request.Id);
        return Result<InsuranceClaimResponse>.Success(claim.ToResponse());
    }
}
