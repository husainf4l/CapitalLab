using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Content;
using CapitalLab.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace CapitalLab.Application.Features.Content.Commands;

// ── Create ────────────────────────────────────────────────────────────────────

public record CreateFaqItemCommand(
    string QuestionEn, string QuestionAr,
    string AnswerEn, string AnswerAr,
    string? Category, int SortOrder)
    : IRequest<Result<Guid>>;

public class CreateFaqItemCommandValidator : AbstractValidator<CreateFaqItemCommand>
{
    public CreateFaqItemCommandValidator()
    {
        RuleFor(x => x.QuestionEn).NotEmpty().MaximumLength(500);
        RuleFor(x => x.QuestionAr).NotEmpty().MaximumLength(500);
        RuleFor(x => x.AnswerEn).NotEmpty();
        RuleFor(x => x.AnswerAr).NotEmpty();
    }
}

public class CreateFaqItemCommandHandler(IRepository<ContentFaqItem> repo, IUnitOfWork uow)
    : IRequestHandler<CreateFaqItemCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateFaqItemCommand req, CancellationToken ct)
    {
        var item = ContentFaqItem.Create(
            req.QuestionEn, req.QuestionAr,
            req.AnswerEn, req.AnswerAr,
            req.Category, req.SortOrder);

        await repo.AddAsync(item, ct);
        await uow.CommitAsync(ct);
        return Result<Guid>.Success(item.Id);
    }
}

// ── Update ────────────────────────────────────────────────────────────────────

public record UpdateFaqItemCommand(
    Guid Id,
    string QuestionEn, string QuestionAr,
    string AnswerEn, string AnswerAr,
    string? Category, int SortOrder)
    : IRequest<Result>;

public class UpdateFaqItemCommandHandler(IRepository<ContentFaqItem> repo, IUnitOfWork uow)
    : IRequestHandler<UpdateFaqItemCommand, Result>
{
    public async Task<Result> Handle(UpdateFaqItemCommand req, CancellationToken ct)
    {
        var item = await repo.GetByIdAsync(req.Id, ct);
        if (item is null)
            return Result.Failure("NotFound", "FAQ item not found.");

        item.Update(req.QuestionEn, req.QuestionAr, req.AnswerEn, req.AnswerAr, req.Category, req.SortOrder);
        await uow.CommitAsync(ct);
        return Result.Success();
    }
}

// ── Delete ────────────────────────────────────────────────────────────────────

public record DeleteFaqItemCommand(Guid Id) : IRequest<Result>;

public class DeleteFaqItemCommandHandler(IRepository<ContentFaqItem> repo, IUnitOfWork uow)
    : IRequestHandler<DeleteFaqItemCommand, Result>
{
    public async Task<Result> Handle(DeleteFaqItemCommand req, CancellationToken ct)
    {
        var item = await repo.GetByIdAsync(req.Id, ct);
        if (item is null)
            return Result.Failure("NotFound", "FAQ item not found.");

        repo.Remove(item);
        await uow.CommitAsync(ct);
        return Result.Success();
    }
}

// ── Toggle Active ─────────────────────────────────────────────────────────────

public record ToggleFaqItemCommand(Guid Id, bool Active) : IRequest<Result>;

public class ToggleFaqItemCommandHandler(IRepository<ContentFaqItem> repo, IUnitOfWork uow)
    : IRequestHandler<ToggleFaqItemCommand, Result>
{
    public async Task<Result> Handle(ToggleFaqItemCommand req, CancellationToken ct)
    {
        var item = await repo.GetByIdAsync(req.Id, ct);
        if (item is null)
            return Result.Failure("NotFound", "FAQ item not found.");

        if (req.Active) item.Activate(); else item.Deactivate();
        await uow.CommitAsync(ct);
        return Result.Success();
    }
}
