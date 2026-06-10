using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Inventory;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace CapitalLab.Application.Features.Inventory.Commands;

// ── Create ────────────────────────────────────────────────────────────────────
public record CreateInventoryItemCommand(
    Guid BranchId, string Name, string Code, string Category, string Unit,
    decimal InitialStock, decimal MinimumStock, decimal MaximumStock, decimal CostPrice,
    string? SupplierName, DateOnly? ExpiryDate, string? BatchNumber) : IRequest<Result<Guid>>;

public class CreateInventoryItemCommandValidator : AbstractValidator<CreateInventoryItemCommand>
{
    public CreateInventoryItemCommandValidator()
    {
        RuleFor(x => x.BranchId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Category).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Unit).NotEmpty().MaximumLength(50);
        RuleFor(x => x.InitialStock).GreaterThanOrEqualTo(0);
        RuleFor(x => x.MinimumStock).GreaterThanOrEqualTo(0);
        RuleFor(x => x.MaximumStock).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CostPrice).GreaterThanOrEqualTo(0);
        RuleFor(x => x.ExpiryDate)
            .GreaterThan(DateOnly.FromDateTime(DateTime.UtcNow))
            .When(x => x.ExpiryDate.HasValue)
            .WithMessage("Expiry date must be in the future.");
    }
}

public class CreateInventoryItemCommandHandler(IRepository<InventoryItem> repo, IUnitOfWork uow)
    : IRequestHandler<CreateInventoryItemCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateInventoryItemCommand request, CancellationToken ct)
    {
        var exists = await repo.ExistsAsync(i => i.BranchId == request.BranchId && i.Code == request.Code.ToUpperInvariant(), ct);
        if (exists) throw new ConflictException($"An item with code '{request.Code}' already exists in this branch.");

        var item = InventoryItem.Create(
            request.BranchId, request.Name, request.Code, request.Category, request.Unit,
            request.InitialStock, request.MinimumStock, request.MaximumStock, request.CostPrice,
            request.SupplierName, request.ExpiryDate, request.BatchNumber);

        await repo.AddAsync(item, ct);
        await uow.CommitAsync(ct);
        return Result<Guid>.Success(item.Id);
    }
}

// ── Update ────────────────────────────────────────────────────────────────────
public record UpdateInventoryItemCommand(
    Guid Id, string Name, string Category, string Unit,
    decimal MinimumStock, decimal MaximumStock, decimal CostPrice,
    string? SupplierName, DateOnly? ExpiryDate, string? BatchNumber) : IRequest<Result>;

public class UpdateInventoryItemCommandHandler(IRepository<InventoryItem> repo, IUnitOfWork uow)
    : IRequestHandler<UpdateInventoryItemCommand, Result>
{
    public async Task<Result> Handle(UpdateInventoryItemCommand request, CancellationToken ct)
    {
        var item = await repo.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException(nameof(InventoryItem), request.Id);

        item.Update(request.Name, request.Category, request.Unit, request.MinimumStock,
            request.MaximumStock, request.CostPrice, request.SupplierName, request.ExpiryDate, request.BatchNumber);

        repo.Update(item);
        await uow.CommitAsync(ct);
        return Result.Success();
    }
}

// ── Stock In ──────────────────────────────────────────────────────────────────
public record StockInCommand(Guid Id, decimal Quantity, decimal UnitCost, string? Reason, string? ReferenceNumber) : IRequest<Result>;

public class StockInCommandValidator : AbstractValidator<StockInCommand>
{
    public StockInCommandValidator()
    {
        RuleFor(x => x.Quantity).GreaterThan(0);
        RuleFor(x => x.UnitCost).GreaterThanOrEqualTo(0);
    }
}

public class StockInCommandHandler(
    IRepository<InventoryItem> itemRepo, IRepository<InventoryTransaction> txRepo, IUnitOfWork uow)
    : IRequestHandler<StockInCommand, Result>
{
    public async Task<Result> Handle(StockInCommand request, CancellationToken ct)
    {
        var item = await itemRepo.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException(nameof(InventoryItem), request.Id);

        item.ReceiveStock(request.Quantity);
        var tx = InventoryTransaction.Create(item.Id, item.BranchId, InventoryTransactionType.StockIn,
            request.Quantity, request.UnitCost, request.Reason, request.ReferenceNumber);

        itemRepo.Update(item);
        await txRepo.AddAsync(tx, ct);
        await uow.CommitAsync(ct);
        return Result.Success();
    }
}

// ── Stock Out ─────────────────────────────────────────────────────────────────
public record StockOutCommand(Guid Id, decimal Quantity, decimal UnitCost, string? Reason, string? ReferenceNumber) : IRequest<Result>;

public class StockOutCommandValidator : AbstractValidator<StockOutCommand>
{
    public StockOutCommandValidator()
    {
        RuleFor(x => x.Quantity).GreaterThan(0);
        RuleFor(x => x.UnitCost).GreaterThanOrEqualTo(0);
    }
}

public class StockOutCommandHandler(
    IRepository<InventoryItem> itemRepo, IRepository<InventoryTransaction> txRepo, IUnitOfWork uow)
    : IRequestHandler<StockOutCommand, Result>
{
    public async Task<Result> Handle(StockOutCommand request, CancellationToken ct)
    {
        var item = await itemRepo.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException(nameof(InventoryItem), request.Id);

        item.IssueStock(request.Quantity);
        var tx = InventoryTransaction.Create(item.Id, item.BranchId, InventoryTransactionType.StockOut,
            request.Quantity, request.UnitCost, request.Reason, request.ReferenceNumber);

        itemRepo.Update(item);
        await txRepo.AddAsync(tx, ct);
        await uow.CommitAsync(ct);
        return Result.Success();
    }
}

// ── Adjust ────────────────────────────────────────────────────────────────────
public record AdjustStockCommand(Guid Id, decimal NewQuantity, string Reason) : IRequest<Result>;

public class AdjustStockCommandValidator : AbstractValidator<AdjustStockCommand>
{
    public AdjustStockCommandValidator()
    {
        RuleFor(x => x.NewQuantity).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Reason).NotEmpty().WithMessage("An adjustment reason is required.");
    }
}

public class AdjustStockCommandHandler(
    IRepository<InventoryItem> itemRepo, IRepository<InventoryTransaction> txRepo, IUnitOfWork uow)
    : IRequestHandler<AdjustStockCommand, Result>
{
    public async Task<Result> Handle(AdjustStockCommand request, CancellationToken ct)
    {
        var item = await itemRepo.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException(nameof(InventoryItem), request.Id);

        var delta = Math.Abs(request.NewQuantity - item.CurrentStock);
        item.AdjustStock(request.NewQuantity, request.Reason);
        var tx = InventoryTransaction.Create(item.Id, item.BranchId, InventoryTransactionType.Adjustment,
            delta <= 0 ? 0.001m : delta, item.CostPrice, request.Reason, null);

        itemRepo.Update(item);
        await txRepo.AddAsync(tx, ct);
        await uow.CommitAsync(ct);
        return Result.Success();
    }
}
