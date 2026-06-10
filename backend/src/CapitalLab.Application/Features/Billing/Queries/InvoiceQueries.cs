using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Billing;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Billing;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.Billing.Queries;

public record GetInvoicesQuery(PaginationRequest Pagination, Guid? BranchId, Guid? PatientId, Domain.Enums.InvoiceStatus? Status)
    : IRequest<Result<PagedResult<InvoiceSummaryResponse>>>;

public class GetInvoicesQueryHandler(IRepository<Invoice> repo)
    : IRequestHandler<GetInvoicesQuery, Result<PagedResult<InvoiceSummaryResponse>>>
{
    public async Task<Result<PagedResult<InvoiceSummaryResponse>>> Handle(GetInvoicesQuery request, CancellationToken ct)
    {
        var query = repo.Query();
        if (request.BranchId.HasValue) query = query.Where(i => i.BranchId == request.BranchId);
        if (request.PatientId.HasValue) query = query.Where(i => i.PatientId == request.PatientId);
        if (request.Status.HasValue) query = query.Where(i => i.Status == request.Status);
        if (!string.IsNullOrWhiteSpace(request.Pagination.Search))
        {
            var s = request.Pagination.Search.ToLower();
            query = query.Where(i => i.InvoiceNumber.ToLower().Contains(s));
        }
        query = query.OrderByDescending(i => i.CreatedAt);

        var totalCount = await query.CountAsync(ct);
        var items = await query.Skip(request.Pagination.Skip).Take(request.Pagination.PageSize).ToListAsync(ct);
        return Result<PagedResult<InvoiceSummaryResponse>>.Success(new PagedResult<InvoiceSummaryResponse>
        {
            Items = items.Select(i => i.ToSummary()).ToList(),
            TotalCount = totalCount,
            Page = request.Pagination.Page,
            PageSize = request.Pagination.PageSize
        });
    }
}

public record GetInvoiceByIdQuery(Guid Id) : IRequest<Result<InvoiceResponse>>;

public class GetInvoiceByIdQueryHandler(IRepository<Invoice> repo)
    : IRequestHandler<GetInvoiceByIdQuery, Result<InvoiceResponse>>
{
    public async Task<Result<InvoiceResponse>> Handle(GetInvoiceByIdQuery request, CancellationToken ct)
    {
        var invoice = await repo.Query().Include(i => i.Items).FirstOrDefaultAsync(i => i.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(Invoice), request.Id);
        return Result<InvoiceResponse>.Success(invoice.ToResponse());
    }
}

public record GetPatientInvoicesQuery(Guid PatientId) : IRequest<Result<List<InvoiceSummaryResponse>>>;

public class GetPatientInvoicesQueryHandler(IRepository<Invoice> repo)
    : IRequestHandler<GetPatientInvoicesQuery, Result<List<InvoiceSummaryResponse>>>
{
    public async Task<Result<List<InvoiceSummaryResponse>>> Handle(GetPatientInvoicesQuery request, CancellationToken ct)
    {
        var list = await repo.Query().Where(i => i.PatientId == request.PatientId)
            .OrderByDescending(i => i.CreatedAt).ToListAsync(ct);
        return Result<List<InvoiceSummaryResponse>>.Success(list.Select(i => i.ToSummary()).ToList());
    }
}
