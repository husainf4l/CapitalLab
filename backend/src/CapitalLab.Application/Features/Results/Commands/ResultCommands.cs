using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Laboratory;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace CapitalLab.Application.Features.Results.Commands;

// ── Commands ─────────────────────────────────────────────────────────────────
public record CreateResultCommand(
    Guid SampleId,
    Guid LabTestId,
    ResultType ResultType,
    decimal? ResultValue,
    string? ResultText,
    string? Unit,
    string? ReferenceRange,
    ResultInterpretation? Interpretation) : IRequest<Result<Guid>>;

public record UpdateResultCommand(
    Guid Id,
    decimal? ResultValue,
    string? ResultText,
    string? Unit,
    string? ReferenceRange,
    ResultInterpretation? Interpretation) : IRequest<Result>;

public record SubmitResultForReviewCommand(Guid Id) : IRequest<Result>;
public record ApproveResultCommand(Guid Id) : IRequest<Result>;
public record ReleaseResultCommand(Guid Id) : IRequest<Result>;
public record AcknowledgeCriticalAlertCommand(Guid AlertId, Guid? AcknowledgedBy) : IRequest<Result>;

// ── Validators ─────────────────────────────────────────────────────────────────
public class CreateResultCommandValidator : AbstractValidator<CreateResultCommand>
{
    public CreateResultCommandValidator()
    {
        RuleFor(x => x.SampleId).NotEmpty();
        RuleFor(x => x.LabTestId).NotEmpty();
        RuleFor(x => x.ResultType).IsInEnum();
        RuleFor(x => x)
            .Must(x => x.ResultValue.HasValue || !string.IsNullOrWhiteSpace(x.ResultText))
            .WithMessage("A result must have either a numeric value or text value.");
        RuleFor(x => x.ResultValue)
            .NotNull()
            .When(x => x.ResultType is ResultType.Numeric or ResultType.RangeBased)
            .WithMessage("Numeric/range-based results require a numeric value.");
    }
}

// ── Critical-detection helper ───────────────────────────────────────────────────
internal static class CriticalDetection
{
    public static async Task EvaluateAsync(
        TestResult result,
        IRepository<CriticalResultRule> ruleRepo,
        IRepository<CriticalResultAlert> alertRepo,
        IDateTimeService clock,
        CancellationToken ct)
    {
        if (result.ResultValue is null) return;

        var rule = await ruleRepo.FirstOrDefaultAsync(r => r.LabTestId == result.LabTestId, ct);
        if (rule is null) return;

        var reason = rule.Evaluate(result.ResultValue.Value);
        if (reason is null) return;

        var alert = CriticalResultAlert.Create(result.Id, clock.UtcNow, reason);
        await alertRepo.AddAsync(alert, ct);

        var interpretation = rule.IsLowBreach(result.ResultValue.Value)
            ? ResultInterpretation.CriticalLow
            : ResultInterpretation.CriticalHigh;

        result.MarkCriticalDetected(alert.Id, reason, interpretation);
    }
}

// ── Handlers ─────────────────────────────────────────────────────────────────
public class CreateResultCommandHandler(
    IRepository<TestResult> resultRepo,
    IRepository<Sample> sampleRepo,
    IRepository<CriticalResultRule> ruleRepo,
    IRepository<CriticalResultAlert> alertRepo,
    ICurrentUserService currentUser,
    IDateTimeService clock,
    IUnitOfWork uow) : IRequestHandler<CreateResultCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateResultCommand request, CancellationToken cancellationToken)
    {
        var sample = await sampleRepo.GetByIdAsync(request.SampleId, cancellationToken)
            ?? throw new NotFoundException(nameof(Sample), request.SampleId);

        var result = TestResult.Create(
            sample.Id, sample.PatientId, request.LabTestId, request.ResultType,
            request.ResultValue, request.ResultText, request.Unit, request.ReferenceRange,
            request.Interpretation, currentUser.UserId, clock.UtcNow);

        await resultRepo.AddAsync(result, cancellationToken);

        await CriticalDetection.EvaluateAsync(result, ruleRepo, alertRepo, clock, cancellationToken);

        await uow.CommitAsync(cancellationToken);
        return Result<Guid>.Success(result.Id);
    }
}

public class UpdateResultCommandHandler(
    IRepository<TestResult> resultRepo,
    IRepository<TestResultHistory> historyRepo,
    IRepository<CriticalResultRule> ruleRepo,
    IRepository<CriticalResultAlert> alertRepo,
    ICurrentUserService currentUser,
    IDateTimeService clock,
    IUnitOfWork uow) : IRequestHandler<UpdateResultCommand, Result>
{
    public async Task<Result> Handle(UpdateResultCommand request, CancellationToken cancellationToken)
    {
        var result = await resultRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(TestResult), request.Id);

        (string? oldValue, string? newValue) snapshot;
        try
        {
            snapshot = result.UpdateValue(
                request.ResultValue, request.ResultText, request.Unit, request.ReferenceRange, request.Interpretation);
        }
        catch (InvalidOperationException ex)
        {
            throw new BusinessRuleException("Result.Immutable", ex.Message);
        }

        if (snapshot.oldValue != snapshot.newValue)
        {
            var history = TestResultHistory.Create(result.Id, snapshot.oldValue, snapshot.newValue, currentUser.UserId, clock.UtcNow);
            await historyRepo.AddAsync(history, cancellationToken);
        }

        await CriticalDetection.EvaluateAsync(result, ruleRepo, alertRepo, clock, cancellationToken);

        resultRepo.Update(result);
        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}

public class SubmitResultForReviewCommandHandler(
    IRepository<TestResult> resultRepo,
    IUnitOfWork uow) : IRequestHandler<SubmitResultForReviewCommand, Result>
{
    public async Task<Result> Handle(SubmitResultForReviewCommand request, CancellationToken cancellationToken)
    {
        var result = await resultRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(TestResult), request.Id);

        try { result.SubmitForReview(); }
        catch (InvalidOperationException ex) { throw new BusinessRuleException("Result.InvalidTransition", ex.Message); }

        resultRepo.Update(result);
        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}

public class ApproveResultCommandHandler(
    IRepository<TestResult> resultRepo,
    ICurrentUserService currentUser,
    IDateTimeService clock,
    IUnitOfWork uow) : IRequestHandler<ApproveResultCommand, Result>
{
    public async Task<Result> Handle(ApproveResultCommand request, CancellationToken cancellationToken)
    {
        var result = await resultRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(TestResult), request.Id);

        try { result.Approve(currentUser.UserId, clock.UtcNow); }
        catch (InvalidOperationException ex) { throw new BusinessRuleException("Result.InvalidTransition", ex.Message); }

        resultRepo.Update(result);
        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}

public class ReleaseResultCommandHandler(
    IRepository<TestResult> resultRepo,
    IUnitOfWork uow) : IRequestHandler<ReleaseResultCommand, Result>
{
    public async Task<Result> Handle(ReleaseResultCommand request, CancellationToken cancellationToken)
    {
        var result = await resultRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(TestResult), request.Id);

        try { result.Release(); }
        catch (InvalidOperationException ex) { throw new BusinessRuleException("Result.InvalidTransition", ex.Message); }

        resultRepo.Update(result);
        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}

public class AcknowledgeCriticalAlertCommandHandler(
    IRepository<CriticalResultAlert> alertRepo,
    ICurrentUserService currentUser,
    IDateTimeService clock,
    IUnitOfWork uow) : IRequestHandler<AcknowledgeCriticalAlertCommand, Result>
{
    public async Task<Result> Handle(AcknowledgeCriticalAlertCommand request, CancellationToken cancellationToken)
    {
        var alert = await alertRepo.GetByIdAsync(request.AlertId, cancellationToken)
            ?? throw new NotFoundException(nameof(CriticalResultAlert), request.AlertId);

        alert.Acknowledge(request.AcknowledgedBy ?? currentUser.UserId, clock.UtcNow);
        alertRepo.Update(alert);
        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}
