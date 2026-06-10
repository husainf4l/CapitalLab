using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Application.Common.Extensions;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Inventory;
using CapitalLab.Domain.Entities.Inventory;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.Inventory.Queries;

// ── Items list ────────────────────────────────────────────────────────────────
public record GetInventoryItemsQuery(PaginationRequest Pagination, Guid? BranchId, string? Category, bool? LowStockOnly)
    : IRequest<Result<PagedResult<InventoryItemResponse>>>;

public class GetInventoryItemsQueryHandler(IRepository<InventoryItem> repo)
    : IRequestHandler<GetInventoryItemsQuery, Result<PagedResult<InventoryItemResponse>>>
{
    public async Task<Result<PagedResult<InventoryItemResponse>>> Handle(GetInventoryItemsQuery request, CancellationToken ct)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var query = repo.Query();

        if (request.BranchId.HasValue) query = query.Where(i => i.BranchId == request.BranchId);
        if (!string.IsNullOrWhiteSpace(request.Category)) query = query.Where(i => i.Category == request.Category);
        if (request.LowStockOnly == true) query = query.Where(i => i.CurrentStock <= i.MinimumStock && i.IsActive);
        if (!string.IsNullOrWhiteSpace(request.Pagination.Search))
        {
            var s = request.Pagination.Search.ToLower();
            query = query.Where(i => i.Name.ToLower().Contains(s) || i.Code.ToLower().Contains(s));
        }

        query = query.OrderBy(i => i.Name);
        var paged = await query.ToPagedResultAsync(request.Pagination, ct);
        return Result<PagedResult<InventoryItemResponse>>.Success(paged.Map(i => i.ToResponse(today)));
    }
}

// ── Item by id ────────────────────────────────────────────────────────────────
public record GetInventoryItemByIdQuery(Guid Id) : IRequest<Result<InventoryItemResponse>>;

public class GetInventoryItemByIdQueryHandler(IRepository<InventoryItem> repo)
    : IRequestHandler<GetInventoryItemByIdQuery, Result<InventoryItemResponse>>
{
    public async Task<Result<InventoryItemResponse>> Handle(GetInventoryItemByIdQuery request, CancellationToken ct)
    {
        var item = await repo.GetByIdAsync(request.Id, ct) ?? throw new NotFoundException(nameof(InventoryItem), request.Id);
        return Result<InventoryItemResponse>.Success(item.ToResponse(DateOnly.FromDateTime(DateTime.UtcNow)));
    }
}

// ── Low stock ─────────────────────────────────────────────────────────────────
public record GetLowStockQuery(Guid? BranchId) : IRequest<Result<List<InventoryItemResponse>>>;

public class GetLowStockQueryHandler(IRepository<InventoryItem> repo)
    : IRequestHandler<GetLowStockQuery, Result<List<InventoryItemResponse>>>
{
    public async Task<Result<List<InventoryItemResponse>>> Handle(GetLowStockQuery request, CancellationToken ct)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var query = repo.Query().Where(i => i.IsActive && i.CurrentStock <= i.MinimumStock);
        if (request.BranchId.HasValue) query = query.Where(i => i.BranchId == request.BranchId);
        var list = await query.OrderBy(i => i.CurrentStock).ToListAsync(ct);
        return Result<List<InventoryItemResponse>>.Success(list.Select(i => i.ToResponse(today)).ToList());
    }
}

// ── Expiring ──────────────────────────────────────────────────────────────────
public record GetExpiringQuery(int Days, Guid? BranchId) : IRequest<Result<List<InventoryItemResponse>>>;

public class GetExpiringQueryHandler(IRepository<InventoryItem> repo)
    : IRequestHandler<GetExpiringQuery, Result<List<InventoryItemResponse>>>
{
    public async Task<Result<List<InventoryItemResponse>>> Handle(GetExpiringQuery request, CancellationToken ct)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var threshold = today.AddDays(request.Days <= 0 ? 30 : request.Days);
        var query = repo.Query().Where(i => i.IsActive && i.ExpiryDate != null && i.ExpiryDate <= threshold);
        if (request.BranchId.HasValue) query = query.Where(i => i.BranchId == request.BranchId);
        var list = await query.OrderBy(i => i.ExpiryDate).ToListAsync(ct);
        return Result<List<InventoryItemResponse>>.Success(list.Select(i => i.ToResponse(today)).ToList());
    }
}

// ── Transactions ──────────────────────────────────────────────────────────────
public record GetInventoryTransactionsQuery(PaginationRequest Pagination, Guid? ItemId, Guid? BranchId)
    : IRequest<Result<PagedResult<InventoryTransactionResponse>>>;

public class GetInventoryTransactionsQueryHandler(IRepository<InventoryTransaction> repo)
    : IRequestHandler<GetInventoryTransactionsQuery, Result<PagedResult<InventoryTransactionResponse>>>
{
    public async Task<Result<PagedResult<InventoryTransactionResponse>>> Handle(GetInventoryTransactionsQuery request, CancellationToken ct)
    {
        var query = repo.Query();
        if (request.ItemId.HasValue) query = query.Where(t => t.InventoryItemId == request.ItemId);
        if (request.BranchId.HasValue) query = query.Where(t => t.BranchId == request.BranchId);
        query = query.OrderByDescending(t => t.CreatedAt);
        var paged = await query.ToPagedResultAsync(request.Pagination, ct);
        return Result<PagedResult<InventoryTransactionResponse>>.Success(paged.Map(t => t.ToResponse()));
    }
}

// ── Purchase orders ───────────────────────────────────────────────────────────
public record GetPurchaseOrdersQuery(PaginationRequest Pagination, Guid? BranchId, Domain.Enums.PurchaseOrderStatus? Status)
    : IRequest<Result<PagedResult<PurchaseOrderResponse>>>;

public class GetPurchaseOrdersQueryHandler(IRepository<PurchaseOrder> repo)
    : IRequestHandler<GetPurchaseOrdersQuery, Result<PagedResult<PurchaseOrderResponse>>>
{
    public async Task<Result<PagedResult<PurchaseOrderResponse>>> Handle(GetPurchaseOrdersQuery request, CancellationToken ct)
    {
        var query = repo.Query().Include(p => p.Items).AsQueryable();
        if (request.BranchId.HasValue) query = query.Where(p => p.BranchId == request.BranchId);
        if (request.Status.HasValue) query = query.Where(p => p.Status == request.Status);
        query = query.OrderByDescending(p => p.CreatedAt);

        var totalCount = await query.CountAsync(ct);
        var items = await query.Skip(request.Pagination.Skip).Take(request.Pagination.PageSize).ToListAsync(ct);
        var result = new PagedResult<PurchaseOrderResponse>
        {
            Items = items.Select(p => p.ToResponse()).ToList(),
            TotalCount = totalCount,
            Page = request.Pagination.Page,
            PageSize = request.Pagination.PageSize
        };
        return Result<PagedResult<PurchaseOrderResponse>>.Success(result);
    }
}

public record GetPurchaseOrderByIdQuery(Guid Id) : IRequest<Result<PurchaseOrderResponse>>;

public class GetPurchaseOrderByIdQueryHandler(IRepository<PurchaseOrder> repo)
    : IRequestHandler<GetPurchaseOrderByIdQuery, Result<PurchaseOrderResponse>>
{
    public async Task<Result<PurchaseOrderResponse>> Handle(GetPurchaseOrderByIdQuery request, CancellationToken ct)
    {
        var po = await repo.Query().Include(p => p.Items).FirstOrDefaultAsync(p => p.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(PurchaseOrder), request.Id);
        return Result<PurchaseOrderResponse>.Success(po.ToResponse());
    }
}
