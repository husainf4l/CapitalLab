using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Billing;
using CapitalLab.Domain.Entities.Operations;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Interfaces;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.Billing.Commands;

public record CreateInvoiceItemInput(string Description, InvoiceItemType ItemType, Guid? ReferenceId, decimal Quantity, decimal UnitPrice, decimal DiscountAmount);

// ── Manual invoice ────────────────────────────────────────────────────────────
public record CreateInvoiceCommand(
    Guid PatientId, Guid BranchId, Guid? TestOrderId, string Currency,
    decimal TaxAmount, decimal DiscountAmount, DateTime? DueAt, string? Notes,
    List<CreateInvoiceItemInput> Items) : IRequest<Result<Guid>>;

public class CreateInvoiceCommandValidator : AbstractValidator<CreateInvoiceCommand>
{
    public CreateInvoiceCommandValidator()
    {
        RuleFor(x => x.PatientId).NotEmpty();
        RuleFor(x => x.BranchId).NotEmpty();
        RuleFor(x => x.Currency).NotEmpty().Length(3);
        RuleFor(x => x.TaxAmount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.DiscountAmount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Items).NotEmpty().WithMessage("An invoice needs at least one item.");
        RuleForEach(x => x.Items).ChildRules(i =>
        {
            i.RuleFor(x => x.Description).NotEmpty();
            i.RuleFor(x => x.Quantity).GreaterThan(0);
            i.RuleFor(x => x.UnitPrice).GreaterThanOrEqualTo(0);
            i.RuleFor(x => x.DiscountAmount).GreaterThanOrEqualTo(0);
        });
    }
}

public class CreateInvoiceCommandHandler(
    IRepository<Invoice> repo, IInvoiceNumberService numberService, IUnitOfWork uow)
    : IRequestHandler<CreateInvoiceCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateInvoiceCommand request, CancellationToken ct)
    {
        var number = await numberService.GenerateNextAsync(DateOnly.FromDateTime(DateTime.UtcNow), ct);
        var invoice = Invoice.Create(number, request.PatientId, request.TestOrderId, request.BranchId,
            request.Currency, request.TaxAmount, request.DueAt, request.Notes);

        foreach (var i in request.Items)
            invoice.AddItem(i.Description, i.ItemType, i.ReferenceId, i.Quantity, i.UnitPrice, i.DiscountAmount);

        if (request.DiscountAmount > 0) invoice.ApplyDiscount(request.DiscountAmount);
        invoice.Issue();

        await repo.AddAsync(invoice, ct);
        await uow.CommitAsync(ct);
        return Result<Guid>.Success(invoice.Id);
    }
}

// ── From test order ───────────────────────────────────────────────────────────
public record CreateInvoiceFromOrderCommand(Guid TestOrderId) : IRequest<Result<Guid>>;

public class CreateInvoiceFromOrderCommandHandler(
    IRepository<Invoice> repo,
    IRepository<TestOrder> orderRepo,
    IInvoiceNumberService numberService,
    IUnitOfWork uow)
    : IRequestHandler<CreateInvoiceFromOrderCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateInvoiceFromOrderCommand request, CancellationToken ct)
    {
        var order = await orderRepo.Query().Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == request.TestOrderId, ct)
            ?? throw new NotFoundException(nameof(TestOrder), request.TestOrderId);

        var existing = await repo.ExistsAsync(i => i.TestOrderId == order.Id, ct);
        if (existing) throw new ConflictException("An invoice already exists for this order.");

        var number = await numberService.GenerateNextAsync(DateOnly.FromDateTime(DateTime.UtcNow), ct);
        var invoice = Invoice.Create(number, order.PatientId, order.Id, order.BranchId, order.Currency, 0m, null, null);

        if (order.Items.Count > 0)
        {
            foreach (var item in order.Items)
                invoice.AddItem(item.NameSnapshot, InvoiceItemType.Test, item.LabTestId ?? item.HealthPackageId,
                    item.Quantity, item.UnitPrice, item.DiscountAmount);
        }
        else
        {
            invoice.AddItem($"Order {order.OrderNumber}", InvoiceItemType.Service, order.Id, 1, order.TotalAmount, 0m);
        }

        if (order.DiscountAmount > 0) invoice.ApplyDiscount(order.DiscountAmount);
        invoice.Issue();

        await repo.AddAsync(invoice, ct);
        await uow.CommitAsync(ct);
        return Result<Guid>.Success(invoice.Id);
    }
}

// ── Cancel / Refund ───────────────────────────────────────────────────────────
public record CancelInvoiceCommand(Guid Id, string? Reason) : IRequest<Result>;
public record RefundInvoiceCommand(Guid Id) : IRequest<Result>;

public class CancelInvoiceCommandHandler(IRepository<Invoice> repo, IUnitOfWork uow)
    : IRequestHandler<CancelInvoiceCommand, Result>
{
    public async Task<Result> Handle(CancelInvoiceCommand request, CancellationToken ct)
    {
        var invoice = await repo.GetByIdAsync(request.Id, ct) ?? throw new NotFoundException(nameof(Invoice), request.Id);
        invoice.Cancel();
        repo.Update(invoice);
        await uow.CommitAsync(ct);
        return Result.Success();
    }
}

public class RefundInvoiceCommandHandler(IRepository<Invoice> repo, IUnitOfWork uow)
    : IRequestHandler<RefundInvoiceCommand, Result>
{
    public async Task<Result> Handle(RefundInvoiceCommand request, CancellationToken ct)
    {
        var invoice = await repo.GetByIdAsync(request.Id, ct) ?? throw new NotFoundException(nameof(Invoice), request.Id);
        invoice.Refund();
        repo.Update(invoice);
        await uow.CommitAsync(ct);
        return Result.Success();
    }
}
