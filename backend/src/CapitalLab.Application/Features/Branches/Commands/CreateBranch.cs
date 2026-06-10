using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Branches;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Organization;
using CapitalLab.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace CapitalLab.Application.Features.Branches.Commands;

// ── Command ──────────────────────────────────────────────────────────────────
public record CreateBranchCommand(
    string Code,
    string Name,
    string? NameAr,
    string? Phone,
    string? Email,
    string? Address,
    string? City,
    string? Area,
    decimal? Latitude,
    decimal? Longitude,
    TimeOnly? OpeningTime,
    TimeOnly? ClosingTime,
    bool IsMainBranch) : IRequest<Result<Guid>>;

// ── Validator ─────────────────────────────────────────────────────────────────
public class CreateBranchCommandValidator : AbstractValidator<CreateBranchCommand>
{
    public CreateBranchCommandValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Branch code is required.")
            .MaximumLength(20).WithMessage("Code must not exceed 20 characters.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Branch name is required.")
            .MaximumLength(150).WithMessage("Name must not exceed 150 characters.");

        RuleFor(x => x.NameAr)
            .MaximumLength(150).When(x => x.NameAr is not null);

        RuleFor(x => x.Email)
            .EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email))
            .WithMessage("Invalid email address.");

        RuleFor(x => x.Phone)
            .MaximumLength(30).When(x => x.Phone is not null);

        RuleFor(x => x.Latitude)
            .InclusiveBetween(-90, 90).When(x => x.Latitude.HasValue)
            .WithMessage("Latitude must be between -90 and 90.");

        RuleFor(x => x.Longitude)
            .InclusiveBetween(-180, 180).When(x => x.Longitude.HasValue)
            .WithMessage("Longitude must be between -180 and 180.");
    }
}

// ── Handler ───────────────────────────────────────────────────────────────────
public class CreateBranchCommandHandler(
    IRepository<Branch> branches,
    IUnitOfWork uow)
    : IRequestHandler<CreateBranchCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(
        CreateBranchCommand request,
        CancellationToken cancellationToken)
    {
        var codeExists = await branches.ExistsAsync(
            b => b.Code == request.Code.Trim().ToUpperInvariant(), cancellationToken);

        if (codeExists)
            throw new ConflictException($"A branch with code '{request.Code}' already exists.");

        var branch = Branch.Create(
            request.Code, request.Name, request.NameAr,
            request.Phone, request.Email,
            request.Address, request.City, request.Area,
            request.Latitude, request.Longitude,
            request.OpeningTime, request.ClosingTime,
            request.IsMainBranch);

        await branches.AddAsync(branch, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        return Result<Guid>.Success(branch.Id);
    }
}
