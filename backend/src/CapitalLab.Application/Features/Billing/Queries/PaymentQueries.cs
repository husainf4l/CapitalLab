using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Billing;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Billing;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.Billing.Queries;

public record GetPaymentsQuery(PaginationRequest Pagination, Guid? BranchId, Guid? InvoiceId)
    : IRequest<Result<PagedResult<PaymentResponse>>>;

public class GetPaymentsQueryHandler(IRepository<Payment> repo)
    : IRequestHandler<GetPaymentsQuery, Result<PagedResult<PaymentResponse>>>
{
    public async Task<Result<PagedResult<PaymentResponse>>> Handle(GetPaymentsQuery request, CancellationToken ct)
    {
        var query = repo.Query();
        if (request.BranchId.HasValue) query = query.Where(p => p.BranchId == request.BranchId);
        if (request.InvoiceId.HasValue) query = query.Where(p => p.InvoiceId == request.InvoiceId);
        query = query.OrderByDescending(p => p.CreatedAt);

        var totalCount = await query.CountAsync(ct);
        var items = await query.Skip(request.Pagination.Skip).Take(request.Pagination.PageSize).ToListAsync(ct);
        return Result<PagedResult<PaymentResponse>>.Success(new PagedResult<PaymentResponse>
        {
            Items = items.Select(p => p.ToResponse()).ToList(),
            TotalCount = totalCount,
            Page = request.Pagination.Page,
            PageSize = request.Pagination.PageSize
        });
    }
}

public record GetPaymentByIdQuery(Guid Id) : IRequest<Result<PaymentResponse>>;

public class GetPaymentByIdQueryHandler(IRepository<Payment> repo)
    : IRequestHandler<GetPaymentByIdQuery, Result<PaymentResponse>>
{
    public async Task<Result<PaymentResponse>> Handle(GetPaymentByIdQuery request, CancellationToken ct)
    {
        var payment = await repo.GetByIdAsync(request.Id, ct) ?? throw new NotFoundException(nameof(Payment), request.Id);
        return Result<PaymentResponse>.Success(payment.ToResponse());
    }
}

public record GetPatientPaymentsQuery(Guid PatientId) : IRequest<Result<List<PaymentResponse>>>;

public class GetPatientPaymentsQueryHandler(IRepository<Payment> repo)
    : IRequestHandler<GetPatientPaymentsQuery, Result<List<PaymentResponse>>>
{
    public async Task<Result<List<PaymentResponse>>> Handle(GetPatientPaymentsQuery request, CancellationToken ct)
    {
        var list = await repo.Query().Where(p => p.PatientId == request.PatientId)
            .OrderByDescending(p => p.CreatedAt).ToListAsync(ct);
        return Result<List<PaymentResponse>>.Success(list.Select(p => p.ToResponse()).ToList());
    }
}
