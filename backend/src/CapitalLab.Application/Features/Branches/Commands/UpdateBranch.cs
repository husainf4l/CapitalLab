using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Organization;
using CapitalLab.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace CapitalLab.Application.Features.Branches.Commands;

public record UpdateBranchCommand(
    Guid Id,
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
    bool IsMainBranch) : IRequest<Result>;

public class UpdateBranchCommandValidator : AbstractValidator<UpdateBranchCommand>
{
    public UpdateBranchCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.NameAr).MaximumLength(150).When(x => x.NameAr is not null);
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
        RuleFor(x => x.Phone).MaximumLength(30).When(x => x.Phone is not null);
        RuleFor(x => x.Latitude).InclusiveBetween(-90m, 90m).When(x => x.Latitude.HasValue);
        RuleFor(x => x.Longitude).InclusiveBetween(-180m, 180m).When(x => x.Longitude.HasValue);
    }
}

public class UpdateBranchCommandHandler(
    IRepository<Branch> branches,
    IUnitOfWork uow)
    : IRequestHandler<UpdateBranchCommand, Result>
{
    public async Task<Result> Handle(UpdateBranchCommand request, CancellationToken cancellationToken)
    {
        var branch = await branches.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Branch), request.Id);

        branch.Update(
            request.Name, request.NameAr,
            request.Phone, request.Email,
            request.Address, request.City, request.Area,
            request.Latitude, request.Longitude,
            request.OpeningTime, request.ClosingTime,
            request.IsMainBranch);

        branches.Update(branch);
        await uow.CommitAsync(cancellationToken);

        return Result.Success();
    }
}
