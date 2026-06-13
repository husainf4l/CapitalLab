using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Content;
using CapitalLab.Domain.Interfaces;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.Content.Commands;

// ── Categories ────────────────────────────────────────────────────────────────

public record CreateContentCategoryCommand(
    string NameEn, string NameAr, string Slug, string? Description, int SortOrder)
    : IRequest<Result<Guid>>;

public class CreateContentCategoryCommandValidator : AbstractValidator<CreateContentCategoryCommand>
{
    public CreateContentCategoryCommandValidator()
    {
        RuleFor(x => x.NameEn).NotEmpty().MaximumLength(200);
        RuleFor(x => x.NameAr).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(200)
            .Matches(@"^[a-z0-9]+(?:-[a-z0-9]+)*$").WithMessage("Slug must be lowercase with hyphens.");
    }
}

public class CreateContentCategoryCommandHandler(IRepository<ContentCategory> cats, IUnitOfWork uow)
    : IRequestHandler<CreateContentCategoryCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateContentCategoryCommand req, CancellationToken ct)
    {
        if (await cats.Query().AnyAsync(c => c.Slug == req.Slug.ToLowerInvariant(), ct))
            return Result<Guid>.Failure("DuplicateSlug", "A category with this slug already exists.");

        var cat = ContentCategory.Create(req.NameEn, req.NameAr, req.Slug, req.Description, req.SortOrder);
        await cats.AddAsync(cat, ct);
        await uow.CommitAsync(ct);
        return Result<Guid>.Success(cat.Id);
    }
}

public record UpdateContentCategoryCommand(
    Guid Id, string NameEn, string NameAr, string Slug, string? Description, int SortOrder)
    : IRequest<Result>;

public class UpdateContentCategoryCommandHandler(IRepository<ContentCategory> cats, IUnitOfWork uow)
    : IRequestHandler<UpdateContentCategoryCommand, Result>
{
    public async Task<Result> Handle(UpdateContentCategoryCommand req, CancellationToken ct)
    {
        var cat = await cats.GetByIdAsync(req.Id, ct);
        if (cat is null) return Result.Failure("NotFound", "Category not found.");

        if (await cats.Query().AnyAsync(c => c.Slug == req.Slug.ToLowerInvariant() && c.Id != req.Id, ct))
            return Result.Failure("DuplicateSlug", "A category with this slug already exists.");

        cat.Update(req.NameEn, req.NameAr, req.Slug, req.Description, req.SortOrder);
        await uow.CommitAsync(ct);
        return Result.Success();
    }
}

public record DeleteContentCategoryCommand(Guid Id) : IRequest<Result>;

public class DeleteContentCategoryCommandHandler(IRepository<ContentCategory> cats, IUnitOfWork uow)
    : IRequestHandler<DeleteContentCategoryCommand, Result>
{
    public async Task<Result> Handle(DeleteContentCategoryCommand req, CancellationToken ct)
    {
        var cat = await cats.GetByIdAsync(req.Id, ct);
        if (cat is null) return Result.Failure("NotFound", "Category not found.");
        cats.Remove(cat);
        await uow.CommitAsync(ct);
        return Result.Success();
    }
}

// ── Authors ───────────────────────────────────────────────────────────────────

public record CreateContentAuthorCommand(
    string FullName, string Slug, string? JobTitle, string? Credentials, string? Bio, string? ImageUrl)
    : IRequest<Result<Guid>>;

public class CreateContentAuthorCommandValidator : AbstractValidator<CreateContentAuthorCommand>
{
    public CreateContentAuthorCommandValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(200)
            .Matches(@"^[a-z0-9]+(?:-[a-z0-9]+)*$").WithMessage("Slug must be lowercase with hyphens.");
    }
}

public class CreateContentAuthorCommandHandler(IRepository<ContentAuthor> authors, IUnitOfWork uow)
    : IRequestHandler<CreateContentAuthorCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateContentAuthorCommand req, CancellationToken ct)
    {
        if (await authors.Query().AnyAsync(a => a.Slug == req.Slug.ToLowerInvariant(), ct))
            return Result<Guid>.Failure("DuplicateSlug", "An author with this slug already exists.");

        var author = ContentAuthor.Create(req.FullName, req.Slug, req.JobTitle, req.Credentials, req.Bio, req.ImageUrl);
        await authors.AddAsync(author, ct);
        await uow.CommitAsync(ct);
        return Result<Guid>.Success(author.Id);
    }
}

public record UpdateContentAuthorCommand(
    Guid Id, string FullName, string Slug, string? JobTitle, string? Credentials, string? Bio, string? ImageUrl)
    : IRequest<Result>;

public class UpdateContentAuthorCommandHandler(IRepository<ContentAuthor> authors, IUnitOfWork uow)
    : IRequestHandler<UpdateContentAuthorCommand, Result>
{
    public async Task<Result> Handle(UpdateContentAuthorCommand req, CancellationToken ct)
    {
        var author = await authors.GetByIdAsync(req.Id, ct);
        if (author is null) return Result.Failure("NotFound", "Author not found.");

        if (await authors.Query().AnyAsync(a => a.Slug == req.Slug.ToLowerInvariant() && a.Id != req.Id, ct))
            return Result.Failure("DuplicateSlug", "An author with this slug already exists.");

        author.Update(req.FullName, req.Slug, req.JobTitle, req.Credentials, req.Bio, req.ImageUrl);
        await uow.CommitAsync(ct);
        return Result.Success();
    }
}

public record DeleteContentAuthorCommand(Guid Id) : IRequest<Result>;

public class DeleteContentAuthorCommandHandler(IRepository<ContentAuthor> authors, IUnitOfWork uow)
    : IRequestHandler<DeleteContentAuthorCommand, Result>
{
    public async Task<Result> Handle(DeleteContentAuthorCommand req, CancellationToken ct)
    {
        var author = await authors.GetByIdAsync(req.Id, ct);
        if (author is null) return Result.Failure("NotFound", "Author not found.");
        authors.Remove(author);
        await uow.CommitAsync(ct);
        return Result.Success();
    }
}

// ── Tags ──────────────────────────────────────────────────────────────────────

public record CreateContentTagCommand(string Name, string Slug) : IRequest<Result<Guid>>;

public class CreateContentTagCommandHandler(IRepository<ContentTag> tags, IUnitOfWork uow)
    : IRequestHandler<CreateContentTagCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateContentTagCommand req, CancellationToken ct)
    {
        if (await tags.Query().AnyAsync(t => t.Slug == req.Slug.ToLowerInvariant(), ct))
            return Result<Guid>.Failure("DuplicateSlug", "A tag with this slug already exists.");

        var tag = ContentTag.Create(req.Name, req.Slug);
        await tags.AddAsync(tag, ct);
        await uow.CommitAsync(ct);
        return Result<Guid>.Success(tag.Id);
    }
}

public record DeleteContentTagCommand(Guid Id) : IRequest<Result>;

public class DeleteContentTagCommandHandler(IRepository<ContentTag> tags, IUnitOfWork uow)
    : IRequestHandler<DeleteContentTagCommand, Result>
{
    public async Task<Result> Handle(DeleteContentTagCommand req, CancellationToken ct)
    {
        var tag = await tags.GetByIdAsync(req.Id, ct);
        if (tag is null) return Result.Failure("NotFound", "Tag not found.");
        tags.Remove(tag);
        await uow.CommitAsync(ct);
        return Result.Success();
    }
}
