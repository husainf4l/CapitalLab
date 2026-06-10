using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Billing;
using CapitalLab.Domain.Entities.Insurance;
using CapitalLab.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace CapitalLab.Application.Features.Insurance.Commands;

// ── Providers ─────────────────────────────────────────────────────────────────
public record CreateProviderCommand(string Name, string Code, string? Phone, string? Email, string? ContactPerson) : IRequest<Result<Guid>>;

public class CreateProviderCommandValidator : AbstractValidator<CreateProviderCommand>
{
    public CreateProviderCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
    }
}

public class CreateProviderCommandHandler(IRepository<InsuranceProvider> repo, IUnitOfWork uow)
    : IRequestHandler<CreateProviderCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateProviderCommand request, CancellationToken ct)
    {
        var exists = await repo.ExistsAsync(p => p.Code == request.Code.ToUpperInvariant(), ct);
        if (exists) throw new ConflictException($"A provider with code '{request.Code}' already exists.");

        var provider = InsuranceProvider.Create(request.Name, request.Code, request.Phone, request.Email, request.ContactPerson);
        await repo.AddAsync(provider, ct);
        await uow.CommitAsync(ct);
        return Result<Guid>.Success(provider.Id);
    }
}

public record UpdateProviderCommand(Guid Id, string Name, string? Phone, string? Email, string? ContactPerson, bool IsActive) : IRequest<Result>;

public class UpdateProviderCommandHandler(IRepository<InsuranceProvider> repo, IUnitOfWork uow)
    : IRequestHandler<UpdateProviderCommand, Result>
{
    public async Task<Result> Handle(UpdateProviderCommand request, CancellationToken ct)
    {
        var provider = await repo.GetByIdAsync(request.Id, ct) ?? throw new NotFoundException(nameof(InsuranceProvider), request.Id);
        provider.Update(request.Name, request.Phone, request.Email, request.ContactPerson);
        if (request.IsActive) provider.Activate(); else provider.Deactivate();
        repo.Update(provider);
        await uow.CommitAsync(ct);
        return Result.Success();
    }
}

// ── Claims ────────────────────────────────────────────────────────────────────
public record CreateClaimFromInvoiceCommand(Guid InvoiceId, Guid ProviderId, decimal ClaimAmount) : IRequest<Result<Guid>>;

public class CreateClaimFromInvoiceCommandValidator : AbstractValidator<CreateClaimFromInvoiceCommand>
{
    public CreateClaimFromInvoiceCommandValidator()
    {
        RuleFor(x => x.InvoiceId).NotEmpty();
        RuleFor(x => x.ProviderId).NotEmpty();
        RuleFor(x => x.ClaimAmount).GreaterThan(0);
    }
}

public class CreateClaimFromInvoiceCommandHandler(
    IRepository<InsuranceClaim> repo,
    IRepository<Invoice> invoiceRepo,
    IRepository<InsuranceProvider> providerRepo,
    IClaimNumberService numberService,
    IUnitOfWork uow)
    : IRequestHandler<CreateClaimFromInvoiceCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateClaimFromInvoiceCommand request, CancellationToken ct)
    {
        var invoice = await invoiceRepo.GetByIdAsync(request.InvoiceId, ct)
            ?? throw new NotFoundException(nameof(Invoice), request.InvoiceId);

        var providerExists = await providerRepo.ExistsAsync(p => p.Id == request.ProviderId && p.IsActive, ct);
        if (!providerExists) throw new NotFoundException(nameof(InsuranceProvider), request.ProviderId);

        // Validation: claim amount cannot exceed the invoice total.
        if (request.ClaimAmount > invoice.TotalAmount + 0.0001m)
            throw new BusinessRuleException("CLAIM_EXCEEDS_INVOICE", "Claim amount cannot exceed the invoice total.");

        var number = await numberService.GenerateNextAsync(DateOnly.FromDateTime(DateTime.UtcNow), ct);
        var claim = InsuranceClaim.Create(number, invoice.PatientId, invoice.Id, request.ProviderId, request.ClaimAmount);

        await repo.AddAsync(claim, ct);
        await uow.CommitAsync(ct);
        return Result<Guid>.Success(claim.Id);
    }
}

public record SubmitClaimCommand(Guid Id) : IRequest<Result>;
public record ApproveClaimCommand(Guid Id, decimal ApprovedAmount) : IRequest<Result>;
public record RejectClaimCommand(Guid Id, string Reason) : IRequest<Result>;
public record MarkClaimPaidCommand(Guid Id) : IRequest<Result>;

public class SubmitClaimCommandHandler(IRepository<InsuranceClaim> repo, IUnitOfWork uow)
    : IRequestHandler<SubmitClaimCommand, Result>
{
    public async Task<Result> Handle(SubmitClaimCommand request, CancellationToken ct)
    {
        var claim = await repo.GetByIdAsync(request.Id, ct) ?? throw new NotFoundException(nameof(InsuranceClaim), request.Id);
        claim.Submit();
        repo.Update(claim);
        await uow.CommitAsync(ct);
        return Result.Success();
    }
}

public class ApproveClaimCommandHandler(IRepository<InsuranceClaim> repo, IUnitOfWork uow)
    : IRequestHandler<ApproveClaimCommand, Result>
{
    public async Task<Result> Handle(ApproveClaimCommand request, CancellationToken ct)
    {
        var claim = await repo.GetByIdAsync(request.Id, ct) ?? throw new NotFoundException(nameof(InsuranceClaim), request.Id);
        claim.Approve(request.ApprovedAmount);
        repo.Update(claim);
        await uow.CommitAsync(ct);
        return Result.Success();
    }
}

public class RejectClaimCommandHandler(IRepository<InsuranceClaim> repo, IUnitOfWork uow)
    : IRequestHandler<RejectClaimCommand, Result>
{
    public async Task<Result> Handle(RejectClaimCommand request, CancellationToken ct)
    {
        var claim = await repo.GetByIdAsync(request.Id, ct) ?? throw new NotFoundException(nameof(InsuranceClaim), request.Id);
        claim.Reject(request.Reason);
        repo.Update(claim);
        await uow.CommitAsync(ct);
        return Result.Success();
    }
}

public class MarkClaimPaidCommandHandler(IRepository<InsuranceClaim> repo, IUnitOfWork uow)
    : IRequestHandler<MarkClaimPaidCommand, Result>
{
    public async Task<Result> Handle(MarkClaimPaidCommand request, CancellationToken ct)
    {
        var claim = await repo.GetByIdAsync(request.Id, ct) ?? throw new NotFoundException(nameof(InsuranceClaim), request.Id);
        claim.MarkPaid();
        repo.Update(claim);
        await uow.CommitAsync(ct);
        return Result.Success();
    }
}
