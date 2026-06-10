using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Laboratory;
using CapitalLab.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace CapitalLab.Application.Features.CriticalResults.Commands;

public record CreateCriticalResultRuleCommand(
    Guid LabTestId,
    decimal? MinCriticalValue,
    decimal? MaxCriticalValue,
    bool IsEnabled) : IRequest<Result<Guid>>;

public record UpdateCriticalResultRuleCommand(
    Guid Id,
    decimal? MinCriticalValue,
    decimal? MaxCriticalValue,
    bool IsEnabled) : IRequest<Result>;

public class CreateCriticalResultRuleCommandValidator : AbstractValidator<CreateCriticalResultRuleCommand>
{
    public CreateCriticalResultRuleCommandValidator()
    {
        RuleFor(x => x.LabTestId).NotEmpty();
        RuleFor(x => x)
            .Must(x => x.MinCriticalValue.HasValue || x.MaxCriticalValue.HasValue)
            .WithMessage("At least one critical threshold (min or max) is required.");
    }
}

public class CreateCriticalResultRuleCommandHandler(
    IRepository<CriticalResultRule> ruleRepo,
    IUnitOfWork uow) : IRequestHandler<CreateCriticalResultRuleCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateCriticalResultRuleCommand request, CancellationToken cancellationToken)
    {
        if (await ruleRepo.ExistsAsync(r => r.LabTestId == request.LabTestId, cancellationToken))
            throw new ConflictException("A critical-result rule already exists for this lab test.");

        CriticalResultRule rule;
        try
        {
            rule = CriticalResultRule.Create(request.LabTestId, request.MinCriticalValue, request.MaxCriticalValue, request.IsEnabled);
        }
        catch (ArgumentException ex)
        {
            throw new BusinessRuleException("CriticalRule.Invalid", ex.Message);
        }

        await ruleRepo.AddAsync(rule, cancellationToken);
        await uow.CommitAsync(cancellationToken);
        return Result<Guid>.Success(rule.Id);
    }
}

public class UpdateCriticalResultRuleCommandHandler(
    IRepository<CriticalResultRule> ruleRepo,
    IUnitOfWork uow) : IRequestHandler<UpdateCriticalResultRuleCommand, Result>
{
    public async Task<Result> Handle(UpdateCriticalResultRuleCommand request, CancellationToken cancellationToken)
    {
        var rule = await ruleRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(CriticalResultRule), request.Id);

        rule.Update(request.MinCriticalValue, request.MaxCriticalValue, request.IsEnabled);
        ruleRepo.Update(rule);
        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}
