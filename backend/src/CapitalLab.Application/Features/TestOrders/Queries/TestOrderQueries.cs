using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Application.Common.Extensions;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.TestOrders;
using ContractOrderItemType = CapitalLab.Contracts.Enums.OrderItemType;
using ContractTestOrderStatus = CapitalLab.Contracts.Enums.TestOrderStatus;
using CapitalLab.Domain.Entities.Operations;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.TestOrders.Queries;

public record GetTestOrdersQuery(PaginationRequest Pagination, Guid? PatientId = null, Guid? BranchId = null, TestOrderStatus? Status = null) : IRequest<Result<PagedResult<TestOrderSummaryResponse>>>;
public record GetTestOrderByIdQuery(Guid Id) : IRequest<Result<TestOrderResponse>>;
public record GetTestOrdersByPatientQuery(Guid PatientId, PaginationRequest Pagination) : IRequest<Result<PagedResult<TestOrderSummaryResponse>>>;

public class GetTestOrdersQueryHandler(IRepository<TestOrder> orderRepo, IRepository<TestOrderItem> itemRepo)
    : IRequestHandler<GetTestOrdersQuery, Result<PagedResult<TestOrderSummaryResponse>>>
{
    public async Task<Result<PagedResult<TestOrderSummaryResponse>>> Handle(GetTestOrdersQuery request, CancellationToken cancellationToken)
    {
        var query = orderRepo.Query();
        if (request.PatientId.HasValue) query = query.Where(o => o.PatientId == request.PatientId);
        if (request.BranchId.HasValue) query = query.Where(o => o.BranchId == request.BranchId);
        if (request.Status.HasValue) query = query.Where(o => o.Status == request.Status);
        if (!string.IsNullOrWhiteSpace(request.Pagination.Search))
        {
            var s = request.Pagination.Search.ToLowerInvariant();
            query = query.Where(o => o.OrderNumber.ToLower().Contains(s));
        }
        query = request.Pagination.IsDescending ? query.OrderByDescending(o => o.CreatedAt) : query.OrderBy(o => o.CreatedAt);
        var paged = await query.ToPagedResultAsync(request.Pagination.WithClampedPageSize(), cancellationToken);
        var orderIds = paged.Items.Select(o => o.Id).ToList();
        var counts = await itemRepo.Query().Where(i => orderIds.Contains(i.TestOrderId)).GroupBy(i => i.TestOrderId).Select(g => new { g.Key, Count = g.Count() }).ToDictionaryAsync(x => x.Key, x => x.Count, cancellationToken);
        return Result<PagedResult<TestOrderSummaryResponse>>.Success(paged.Map(o => new TestOrderSummaryResponse(o.Id, o.OrderNumber, o.PatientId, o.AppointmentId, o.BranchId, (ContractTestOrderStatus)o.Status, o.TotalAmount, o.Currency, counts.TryGetValue(o.Id, out var count) ? count : 0)));
    }
}

public class GetTestOrderByIdQueryHandler(IRepository<TestOrder> orderRepo, IRepository<TestOrderItem> itemRepo)
    : IRequestHandler<GetTestOrderByIdQuery, Result<TestOrderResponse>>
{
    public async Task<Result<TestOrderResponse>> Handle(GetTestOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var order = await orderRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(TestOrder), request.Id);
        var items = await itemRepo.Query().Where(i => i.TestOrderId == order.Id).ToListAsync(cancellationToken);
        return Result<TestOrderResponse>.Success(new TestOrderResponse(
            order.Id, order.OrderNumber, order.PatientId, order.AppointmentId, order.BranchId, (ContractTestOrderStatus)order.Status,
            order.SubtotalAmount, order.DiscountAmount, order.TotalAmount, order.Currency, order.Notes,
            items.Select(i => new TestOrderItemResponse(i.Id, i.LabTestId, i.HealthPackageId, (ContractOrderItemType)i.ItemType, i.NameSnapshot, i.CodeSnapshot, i.Quantity, i.UnitPrice, i.DiscountAmount, i.TotalPrice, i.Currency)).ToList()));
    }
}

public class GetTestOrdersByPatientQueryHandler(ISender sender) : IRequestHandler<GetTestOrdersByPatientQuery, Result<PagedResult<TestOrderSummaryResponse>>>
{
    public Task<Result<PagedResult<TestOrderSummaryResponse>>> Handle(GetTestOrdersByPatientQuery request, CancellationToken cancellationToken) =>
        sender.Send(new GetTestOrdersQuery(request.Pagination, PatientId: request.PatientId), cancellationToken);
}
