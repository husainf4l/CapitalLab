using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Billing;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace CapitalLab.Application.Features.Billing.Commands;

// ── Record payment ────────────────────────────────────────────────────────────
public record RecordPaymentCommand(Guid InvoiceId, decimal Amount, PaymentMethod Method, string? TransactionReference, string? Notes)
    : IRequest<Result<Guid>>;

public class RecordPaymentCommandValidator : AbstractValidator<RecordPaymentCommand>
{
    public RecordPaymentCommandValidator()
    {
        RuleFor(x => x.InvoiceId).NotEmpty();
        RuleFor(x => x.Amount).GreaterThan(0).WithMessage("Payment amount must be positive.");
    }
}

public class RecordPaymentCommandHandler(
    IRepository<Payment> paymentRepo, IRepository<Invoice> invoiceRepo, IUnitOfWork uow)
    : IRequestHandler<RecordPaymentCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(RecordPaymentCommand request, CancellationToken ct)
    {
        var invoice = await invoiceRepo.GetByIdAsync(request.InvoiceId, ct)
            ?? throw new NotFoundException(nameof(Invoice), request.InvoiceId);

        // Domain enforces: payment cannot exceed outstanding balance.
        invoice.RegisterPayment(request.Amount);

        var payment = Payment.Record(invoice.Id, invoice.PatientId, invoice.BranchId,
            request.Amount, invoice.Currency, request.Method, request.TransactionReference, request.Notes);

        invoiceRepo.Update(invoice);
        await paymentRepo.AddAsync(payment, ct);
        await uow.CommitAsync(ct);
        return Result<Guid>.Success(payment.Id);
    }
}

// ── Refund payment ────────────────────────────────────────────────────────────
public record RefundPaymentCommand(Guid Id) : IRequest<Result>;

public class RefundPaymentCommandHandler(
    IRepository<Payment> paymentRepo, IRepository<Invoice> invoiceRepo, IUnitOfWork uow)
    : IRequestHandler<RefundPaymentCommand, Result>
{
    public async Task<Result> Handle(RefundPaymentCommand request, CancellationToken ct)
    {
        var payment = await paymentRepo.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException(nameof(Payment), request.Id);

        payment.Refund();
        var invoice = await invoiceRepo.GetByIdAsync(payment.InvoiceId, ct);
        if (invoice is not null)
        {
            invoice.ReversePayment(payment.Amount);
            invoiceRepo.Update(invoice);
        }

        paymentRepo.Update(payment);
        await uow.CommitAsync(ct);
        return Result.Success();
    }
}
