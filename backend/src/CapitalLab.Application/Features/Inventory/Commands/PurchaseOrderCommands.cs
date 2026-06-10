using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Inventory;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace CapitalLab.Application.Features.Inventory.Commands;

public record CreatePurchaseOrderItemInput(Guid InventoryItemId, decimal Quantity, decimal UnitCost);

public record CreatePurchaseOrderCommand(
    Guid BranchId, string SupplierName, string Currency, string? Notes,
    List<CreatePurchaseOrderItemInput> Items) : IRequest<Result<Guid>>;

public class CreatePurchaseOrderCommandValidator : AbstractValidator<CreatePurchaseOrderCommand>
{
    public CreatePurchaseOrderCommandValidator()
    {
        RuleFor(x => x.BranchId).NotEmpty();
        RuleFor(x => x.SupplierName).NotEmpty().WithMessage("A supplier is required.").MaximumLength(200);
        RuleFor(x => x.Currency).NotEmpty().Length(3);
        RuleFor(x => x.Items).NotEmpty().WithMessage("A purchase order needs at least one item.");
        RuleForEach(x => x.Items).ChildRules(i =>
        {
            i.RuleFor(x => x.Quantity).GreaterThan(0);
            i.RuleFor(x => x.UnitCost).GreaterThanOrEqualTo(0);
        });
    }
}

public class CreatePurchaseOrderCommandHandler(
    IRepository<PurchaseOrder> repo, IPurchaseOrderNumberService numberService, IUnitOfWork uow)
    : IRequestHandler<CreatePurchaseOrderCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreatePurchaseOrderCommand request, CancellationToken ct)
    {
        var number = await numberService.GenerateNextAsync(DateOnly.FromDateTime(DateTime.UtcNow), ct);
        var po = PurchaseOrder.Create(number, request.BranchId, request.SupplierName, request.Currency, request.Notes);

        foreach (var item in request.Items)
            po.AddItem(item.InventoryItemId, item.Quantity, item.UnitCost);

        await repo.AddAsync(po, ct);
        await uow.CommitAsync(ct);
        return Result<Guid>.Success(po.Id);
    }
}

// ── Lifecycle transitions ─────────────────────────────────────────────────────
public record SubmitPurchaseOrderCommand(Guid Id) : IRequest<Result>;
public record ApprovePurchaseOrderCommand(Guid Id) : IRequest<Result>;
public record CancelPurchaseOrderCommand(Guid Id) : IRequest<Result>;

public class SubmitPurchaseOrderCommandHandler(IRepository<PurchaseOrder> repo, IUnitOfWork uow)
    : IRequestHandler<SubmitPurchaseOrderCommand, Result>
{
    public async Task<Result> Handle(SubmitPurchaseOrderCommand request, CancellationToken ct)
    {
        var po = await LoadWithItems(repo, request.Id, ct);
        po.Submit();
        repo.Update(po);
        await uow.CommitAsync(ct);
        return Result.Success();
    }

    internal static async Task<PurchaseOrder> LoadWithItems(IRepository<PurchaseOrder> repo, Guid id, CancellationToken ct)
    {
        var po = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstOrDefaultAsync(
            Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.Include(repo.Query(), p => p.Items),
            p => p.Id == id, ct);
        return po ?? throw new NotFoundException(nameof(PurchaseOrder), id);
    }
}

public class ApprovePurchaseOrderCommandHandler(IRepository<PurchaseOrder> repo, IUnitOfWork uow)
    : IRequestHandler<ApprovePurchaseOrderCommand, Result>
{
    public async Task<Result> Handle(ApprovePurchaseOrderCommand request, CancellationToken ct)
    {
        var po = await SubmitPurchaseOrderCommandHandler.LoadWithItems(repo, request.Id, ct);
        po.Approve();
        repo.Update(po);
        await uow.CommitAsync(ct);
        return Result.Success();
    }
}

public class CancelPurchaseOrderCommandHandler(IRepository<PurchaseOrder> repo, IUnitOfWork uow)
    : IRequestHandler<CancelPurchaseOrderCommand, Result>
{
    public async Task<Result> Handle(CancelPurchaseOrderCommand request, CancellationToken ct)
    {
        var po = await SubmitPurchaseOrderCommandHandler.LoadWithItems(repo, request.Id, ct);
        po.Cancel();
        repo.Update(po);
        await uow.CommitAsync(ct);
        return Result.Success();
    }
}

// ── Receive (moves stock into items) ──────────────────────────────────────────
public record ReceivePurchaseOrderCommand(Guid Id) : IRequest<Result>;

public class ReceivePurchaseOrderCommandHandler(
    IRepository<PurchaseOrder> repo,
    IRepository<InventoryItem> itemRepo,
    IRepository<InventoryTransaction> txRepo,
    IUnitOfWork uow)
    : IRequestHandler<ReceivePurchaseOrderCommand, Result>
{
    public async Task<Result> Handle(ReceivePurchaseOrderCommand request, CancellationToken ct)
    {
        var po = await SubmitPurchaseOrderCommandHandler.LoadWithItems(repo, request.Id, ct);
        po.Receive();

        foreach (var line in po.Items)
        {
            var item = await itemRepo.GetByIdAsync(line.InventoryItemId, ct);
            if (item is null) continue;
            item.ReceiveStock(line.Quantity);
            itemRepo.Update(item);
            await txRepo.AddAsync(InventoryTransaction.Create(
                item.Id, item.BranchId, InventoryTransactionType.StockIn,
                line.Quantity, line.UnitCost, $"Received via PO {po.OrderNumber}", po.OrderNumber), ct);
        }

        repo.Update(po);
        await uow.CommitAsync(ct);
        return Result.Success();
    }
}
