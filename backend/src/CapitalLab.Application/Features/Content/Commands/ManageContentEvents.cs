using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Content;
using CapitalLab.Domain.Interfaces;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.Content.Commands;

public record CreateContentEventCommand(
    string TitleEn, string TitleAr,
    string? DescriptionEn, string? DescriptionAr,
    string Slug, DateTime EventDate, DateTime? EndDate,
    string? Location, string? CoverImageUrl, string? RegistrationUrl,
    string? MetaTitle, string? MetaDescription)
    : IRequest<Result<Guid>>;

public class CreateContentEventCommandValidator : AbstractValidator<CreateContentEventCommand>
{
    public CreateContentEventCommandValidator()
    {
        RuleFor(x => x.TitleEn).NotEmpty().MaximumLength(500);
        RuleFor(x => x.TitleAr).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(500)
            .Matches(@"^[a-z0-9]+(?:-[a-z0-9]+)*$").WithMessage("Slug must be lowercase with hyphens.");
        RuleFor(x => x.EventDate).NotEmpty();
        RuleFor(x => x.EndDate).GreaterThan(x => x.EventDate)
            .When(x => x.EndDate.HasValue).WithMessage("End date must be after event date.");
    }
}

public class CreateContentEventCommandHandler(IRepository<ContentEvent> events, IUnitOfWork uow)
    : IRequestHandler<CreateContentEventCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateContentEventCommand req, CancellationToken ct)
    {
        if (await events.Query().AnyAsync(e => e.Slug == req.Slug.ToLowerInvariant(), ct))
            return Result<Guid>.Failure("DuplicateSlug", "An event with this slug already exists.");

        var ev = ContentEvent.Create(req.TitleEn, req.TitleAr, req.DescriptionEn, req.DescriptionAr,
            req.Slug, req.EventDate, req.EndDate, req.Location, req.CoverImageUrl, req.RegistrationUrl,
            req.MetaTitle, req.MetaDescription);

        await events.AddAsync(ev, ct);
        await uow.CommitAsync(ct);
        return Result<Guid>.Success(ev.Id);
    }
}

public record UpdateContentEventCommand(
    Guid Id,
    string TitleEn, string TitleAr,
    string? DescriptionEn, string? DescriptionAr,
    string Slug, DateTime EventDate, DateTime? EndDate,
    string? Location, string? CoverImageUrl, string? RegistrationUrl,
    string? MetaTitle, string? MetaDescription)
    : IRequest<Result>;

public class UpdateContentEventCommandHandler(IRepository<ContentEvent> events, IUnitOfWork uow)
    : IRequestHandler<UpdateContentEventCommand, Result>
{
    public async Task<Result> Handle(UpdateContentEventCommand req, CancellationToken ct)
    {
        var ev = await events.GetByIdAsync(req.Id, ct);
        if (ev is null) return Result.Failure("NotFound", "Event not found.");

        if (await events.Query().AnyAsync(e => e.Slug == req.Slug.ToLowerInvariant() && e.Id != req.Id, ct))
            return Result.Failure("DuplicateSlug", "An event with this slug already exists.");

        ev.Update(req.TitleEn, req.TitleAr, req.DescriptionEn, req.DescriptionAr,
            req.Slug, req.EventDate, req.EndDate, req.Location, req.CoverImageUrl, req.RegistrationUrl,
            req.MetaTitle, req.MetaDescription);

        await uow.CommitAsync(ct);
        return Result.Success();
    }
}

public record DeleteContentEventCommand(Guid Id) : IRequest<Result>;

public class DeleteContentEventCommandHandler(IRepository<ContentEvent> events, IUnitOfWork uow)
    : IRequestHandler<DeleteContentEventCommand, Result>
{
    public async Task<Result> Handle(DeleteContentEventCommand req, CancellationToken ct)
    {
        var ev = await events.GetByIdAsync(req.Id, ct);
        if (ev is null) return Result.Failure("NotFound", "Event not found.");
        events.Remove(ev);
        await uow.CommitAsync(ct);
        return Result.Success();
    }
}

public record PublishContentEventCommand(Guid Id, bool Publish) : IRequest<Result>;

public class PublishContentEventCommandHandler(IRepository<ContentEvent> events, IUnitOfWork uow)
    : IRequestHandler<PublishContentEventCommand, Result>
{
    public async Task<Result> Handle(PublishContentEventCommand req, CancellationToken ct)
    {
        var ev = await events.GetByIdAsync(req.Id, ct);
        if (ev is null) return Result.Failure("NotFound", "Event not found.");
        if (req.Publish) ev.Publish(); else ev.Unpublish();
        await uow.CommitAsync(ct);
        return Result.Success();
    }
}

public record IncrementEventViewCommand(Guid Id) : IRequest;

public class IncrementEventViewCommandHandler(IRepository<ContentEvent> events, IUnitOfWork uow)
    : IRequestHandler<IncrementEventViewCommand>
{
    public async Task Handle(IncrementEventViewCommand req, CancellationToken ct)
    {
        var ev = await events.GetByIdAsync(req.Id, ct);
        ev?.IncrementView();
        if (ev is not null) await uow.CommitAsync(ct);
    }
}
