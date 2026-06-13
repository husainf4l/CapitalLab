using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Content;
using CapitalLab.Domain.Interfaces;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace CapitalLab.Application.Features.Content.Commands;

// ── Subscribe ─────────────────────────────────────────────────────────────────

public record SubscribeNewsletterCommand(string Email, string Language) : IRequest<Result>;

public class SubscribeNewsletterCommandValidator : AbstractValidator<SubscribeNewsletterCommand>
{
    public SubscribeNewsletterCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(320);
    }
}

public class SubscribeNewsletterCommandHandler(
    IRepository<ContentNewsletterSubscriber> repo,
    IUnitOfWork uow)
    : IRequestHandler<SubscribeNewsletterCommand, Result>
{
    public async Task<Result> Handle(SubscribeNewsletterCommand req, CancellationToken ct)
    {
        var email = req.Email.Trim().ToLowerInvariant();

        var existing = await repo.Query()
            .FirstOrDefaultAsync(s => s.Email == email, ct);

        if (existing is not null)
        {
            if (existing.IsUnsubscribed)
            {
                existing.Resubscribe();
                await uow.CommitAsync(ct);
                return Result.Success();
            }
            return Result.Failure("AlreadySubscribed", "This email is already subscribed.");
        }

        var subscriber = ContentNewsletterSubscriber.Create(email, req.Language);
        await repo.AddAsync(subscriber, ct);
        await uow.CommitAsync(ct);
        return Result.Success();
    }
}

// ── Unsubscribe ───────────────────────────────────────────────────────────────

public record UnsubscribeNewsletterCommand(string Token) : IRequest<Result>;

public class UnsubscribeNewsletterCommandHandler(
    IRepository<ContentNewsletterSubscriber> repo,
    IUnitOfWork uow)
    : IRequestHandler<UnsubscribeNewsletterCommand, Result>
{
    public async Task<Result> Handle(UnsubscribeNewsletterCommand req, CancellationToken ct)
    {
        var subscriber = await repo.Query()
            .FirstOrDefaultAsync(s => s.UnsubscribeToken == req.Token, ct);

        if (subscriber is null)
            return Result.Failure("NotFound", "Subscriber not found.");

        subscriber.Unsubscribe();
        await uow.CommitAsync(ct);
        return Result.Success();
    }
}

// ── Admin: Delete subscriber ──────────────────────────────────────────────────

public record DeleteNewsletterSubscriberCommand(Guid Id) : IRequest<Result>;

public class DeleteNewsletterSubscriberCommandHandler(
    IRepository<ContentNewsletterSubscriber> repo,
    IUnitOfWork uow)
    : IRequestHandler<DeleteNewsletterSubscriberCommand, Result>
{
    public async Task<Result> Handle(DeleteNewsletterSubscriberCommand req, CancellationToken ct)
    {
        var sub = await repo.GetByIdAsync(req.Id, ct);
        if (sub is null)
            return Result.Failure("NotFound", "Subscriber not found.");

        repo.Remove(sub);
        await uow.CommitAsync(ct);
        return Result.Success();
    }
}

// ── Export CSV ────────────────────────────────────────────────────────────────

public record ExportNewsletterCsvQuery : IRequest<Result<string>>;

public class ExportNewsletterCsvQueryHandler(IRepository<ContentNewsletterSubscriber> repo)
    : IRequestHandler<ExportNewsletterCsvQuery, Result<string>>
{
    public async Task<Result<string>> Handle(ExportNewsletterCsvQuery req, CancellationToken ct)
    {
        var subs = await repo.Query()
            .Where(s => !s.IsUnsubscribed)
            .OrderBy(s => s.CreatedAt)
            .Select(s => new { s.Email, s.Language, s.CreatedAt })
            .ToListAsync(ct);

        var sb = new StringBuilder();
        sb.AppendLine("Email,Language,SubscribedAt");
        foreach (var s in subs)
            sb.AppendLine($"{s.Email},{s.Language},{s.CreatedAt:yyyy-MM-dd HH:mm:ss}");

        return Result<string>.Success(sb.ToString());
    }
}
