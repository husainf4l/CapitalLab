using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Enums;
using CapitalLab.Domain.Entities.Content;
using DomainEnums = CapitalLab.Domain.Enums;
using CapitalLab.Domain.Interfaces;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.Content.Commands;

// ── Create ────────────────────────────────────────────────────────────────────

public record CreateContentPostCommand(
    ContentPostType Type, Guid? CategoryId, Guid? AuthorId,
    string TitleEn, string TitleAr,
    string? SummaryEn, string? SummaryAr,
    string ContentEn, string ContentAr,
    string Slug, string? FeaturedImageUrl, string? ThumbnailUrl,
    string? MetaTitle, string? MetaDescription, string? Keywords,
    DateTime? ExpiryDate, DateTime? PublishAt, List<Guid>? TagIds) : IRequest<Result<Guid>>;

public class CreateContentPostCommandValidator : AbstractValidator<CreateContentPostCommand>
{
    public CreateContentPostCommandValidator()
    {
        RuleFor(x => x.TitleEn).NotEmpty().MaximumLength(500);
        RuleFor(x => x.TitleAr).NotEmpty().MaximumLength(500);
        RuleFor(x => x.ContentEn).NotEmpty();
        RuleFor(x => x.ContentAr).NotEmpty();
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(500)
            .Matches(@"^[a-z0-9]+(?:-[a-z0-9]+)*$")
            .WithMessage("Slug must be lowercase letters, numbers, and hyphens only.");
    }
}

public class CreateContentPostCommandHandler(
    IRepository<ContentPost> posts,
    IRepository<ContentTag> tags,
    IUnitOfWork uow)
    : IRequestHandler<CreateContentPostCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateContentPostCommand request, CancellationToken cancellationToken)
    {
        var slugExists = await posts.Query().AnyAsync(p => p.Slug == request.Slug.ToLowerInvariant(), cancellationToken);
        if (slugExists)
            return Result<Guid>.Failure("DuplicateSlug", "A post with this slug already exists.");

        var post = ContentPost.Create(
            (DomainEnums.ContentPostType)(int)request.Type,
            request.CategoryId, request.AuthorId,
            request.TitleEn, request.TitleAr,
            request.SummaryEn, request.SummaryAr,
            request.ContentEn, request.ContentAr,
            request.Slug, request.FeaturedImageUrl, request.ThumbnailUrl,
            request.MetaTitle, request.MetaDescription, request.Keywords,
            request.ExpiryDate, request.PublishAt);

        await posts.AddAsync(post, cancellationToken);

        if (request.TagIds?.Count > 0)
        {
            var existingTagIds = await tags.Query()
                .Where(t => request.TagIds.Contains(t.Id))
                .Select(t => t.Id)
                .ToListAsync(cancellationToken);

            foreach (var tagId in existingTagIds)
                post.PostTags.Add(ContentPostTag.Create(post.Id, tagId));
        }

        await uow.CommitAsync(cancellationToken);
        return Result<Guid>.Success(post.Id);
    }
}

// ── Update ────────────────────────────────────────────────────────────────────

public record UpdateContentPostCommand(
    Guid Id,
    ContentPostType Type, Guid? CategoryId, Guid? AuthorId,
    string TitleEn, string TitleAr,
    string? SummaryEn, string? SummaryAr,
    string ContentEn, string ContentAr,
    string Slug, string? FeaturedImageUrl, string? ThumbnailUrl,
    string? MetaTitle, string? MetaDescription, string? Keywords,
    DateTime? ExpiryDate, DateTime? PublishAt, List<Guid>? TagIds) : IRequest<Result>;

public class UpdateContentPostCommandValidator : AbstractValidator<UpdateContentPostCommand>
{
    public UpdateContentPostCommandValidator()
    {
        RuleFor(x => x.TitleEn).NotEmpty().MaximumLength(500);
        RuleFor(x => x.TitleAr).NotEmpty().MaximumLength(500);
        RuleFor(x => x.ContentEn).NotEmpty();
        RuleFor(x => x.ContentAr).NotEmpty();
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(500)
            .Matches(@"^[a-z0-9]+(?:-[a-z0-9]+)*$")
            .WithMessage("Slug must be lowercase letters, numbers, and hyphens only.");
    }
}

public class UpdateContentPostCommandHandler(
    IRepository<ContentPost> posts,
    IRepository<ContentTag> tags,
    IUnitOfWork uow)
    : IRequestHandler<UpdateContentPostCommand, Result>
{
    public async Task<Result> Handle(UpdateContentPostCommand request, CancellationToken cancellationToken)
    {
        var post = await posts.Query()
            .Include(p => p.PostTags)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (post is null)
            return Result.Failure("NotFound", "Post not found.");

        var slugExists = await posts.Query()
            .AnyAsync(p => p.Slug == request.Slug.ToLowerInvariant() && p.Id != request.Id, cancellationToken);
        if (slugExists)
            return Result.Failure("DuplicateSlug", "A post with this slug already exists.");

        post.Update(
            (DomainEnums.ContentPostType)(int)request.Type,
            request.CategoryId, request.AuthorId,
            request.TitleEn, request.TitleAr,
            request.SummaryEn, request.SummaryAr,
            request.ContentEn, request.ContentAr,
            request.Slug, request.FeaturedImageUrl, request.ThumbnailUrl,
            request.MetaTitle, request.MetaDescription, request.Keywords,
            request.ExpiryDate, request.PublishAt);

        post.PostTags.Clear();
        if (request.TagIds?.Count > 0)
        {
            var existingTagIds = await tags.Query()
                .Where(t => request.TagIds.Contains(t.Id))
                .Select(t => t.Id)
                .ToListAsync(cancellationToken);

            foreach (var tagId in existingTagIds)
                post.PostTags.Add(ContentPostTag.Create(post.Id, tagId));
        }

        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}

// ── Delete ────────────────────────────────────────────────────────────────────

public record DeleteContentPostCommand(Guid Id) : IRequest<Result>;

public class DeleteContentPostCommandHandler(IRepository<ContentPost> posts, IUnitOfWork uow)
    : IRequestHandler<DeleteContentPostCommand, Result>
{
    public async Task<Result> Handle(DeleteContentPostCommand request, CancellationToken cancellationToken)
    {
        var post = await posts.GetByIdAsync(request.Id, cancellationToken);
        if (post is null)
            return Result.Failure("NotFound", "Post not found.");

        posts.Remove(post);
        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}

// ── Publish / Unpublish ───────────────────────────────────────────────────────

public record PublishContentPostCommand(Guid Id, bool Publish) : IRequest<Result>;

public class PublishContentPostCommandHandler(IRepository<ContentPost> posts, IUnitOfWork uow)
    : IRequestHandler<PublishContentPostCommand, Result>
{
    public async Task<Result> Handle(PublishContentPostCommand request, CancellationToken cancellationToken)
    {
        var post = await posts.GetByIdAsync(request.Id, cancellationToken);
        if (post is null)
            return Result.Failure("NotFound", "Post not found.");

        if (request.Publish) post.Publish(); else post.Unpublish();
        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}

// ── Feature / Unfeature ───────────────────────────────────────────────────────

public record FeatureContentPostCommand(Guid Id, bool Feature) : IRequest<Result>;

public class FeatureContentPostCommandHandler(IRepository<ContentPost> posts, IUnitOfWork uow)
    : IRequestHandler<FeatureContentPostCommand, Result>
{
    public async Task<Result> Handle(FeatureContentPostCommand request, CancellationToken cancellationToken)
    {
        var post = await posts.GetByIdAsync(request.Id, cancellationToken);
        if (post is null)
            return Result.Failure("NotFound", "Post not found.");

        if (request.Feature) post.Feature(); else post.Unfeature();
        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}

// ── Increment view ────────────────────────────────────────────────────────────

public record IncrementPostViewCommand(Guid Id) : IRequest;

public class IncrementPostViewCommandHandler(IRepository<ContentPost> posts, IUnitOfWork uow)
    : IRequestHandler<IncrementPostViewCommand>
{
    public async Task Handle(IncrementPostViewCommand request, CancellationToken cancellationToken)
    {
        var post = await posts.GetByIdAsync(request.Id, cancellationToken);
        post?.IncrementView();
        if (post is not null)
            await uow.CommitAsync(cancellationToken);
    }
}
