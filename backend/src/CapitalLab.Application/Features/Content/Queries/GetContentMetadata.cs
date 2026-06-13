using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Content;
using CapitalLab.Domain.Entities.Content;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.Content.Queries;

// ── Categories ────────────────────────────────────────────────────────────────

public record GetContentCategoriesQuery(bool ActiveOnly = true)
    : IRequest<Result<List<ContentCategoryResponse>>>;

public class GetContentCategoriesQueryHandler(IRepository<ContentCategory> categories)
    : IRequestHandler<GetContentCategoriesQuery, Result<List<ContentCategoryResponse>>>
{
    public async Task<Result<List<ContentCategoryResponse>>> Handle(
        GetContentCategoriesQuery request,
        CancellationToken cancellationToken)
    {
        var query = categories.Query()
            .Include(c => c.Posts)
            .AsNoTracking();

        if (request.ActiveOnly)
            query = query.Where(c => c.IsActive);

        var list = await query.OrderBy(c => c.SortOrder).ToListAsync(cancellationToken);

        return Result<List<ContentCategoryResponse>>.Success(list.Select(c =>
            new ContentCategoryResponse(c.Id, c.NameEn, c.NameAr, c.Slug, c.Description, c.SortOrder, c.IsActive,
                c.Posts.Count(p => p.IsPublished))).ToList());
    }
}

// ── Authors ───────────────────────────────────────────────────────────────────

public record GetContentAuthorsQuery(bool ActiveOnly = true)
    : IRequest<Result<List<ContentAuthorResponse>>>;

public class GetContentAuthorsQueryHandler(IRepository<ContentAuthor> authors)
    : IRequestHandler<GetContentAuthorsQuery, Result<List<ContentAuthorResponse>>>
{
    public async Task<Result<List<ContentAuthorResponse>>> Handle(
        GetContentAuthorsQuery request,
        CancellationToken cancellationToken)
    {
        var query = authors.Query()
            .Include(a => a.Posts)
            .AsNoTracking();

        if (request.ActiveOnly)
            query = query.Where(a => a.IsActive);

        var list = await query.OrderBy(a => a.FullName).ToListAsync(cancellationToken);

        return Result<List<ContentAuthorResponse>>.Success(list.Select(a =>
            new ContentAuthorResponse(a.Id, a.FullName, a.Slug, a.JobTitle, a.Credentials, a.Bio, a.ImageUrl, a.IsActive,
                a.Posts.Count(p => p.IsPublished))).ToList());
    }
}

// ── Tags ──────────────────────────────────────────────────────────────────────

public record GetContentTagsQuery : IRequest<Result<List<ContentTagResponse>>>;

public class GetContentTagsQueryHandler(IRepository<ContentTag> tags)
    : IRequestHandler<GetContentTagsQuery, Result<List<ContentTagResponse>>>
{
    public async Task<Result<List<ContentTagResponse>>> Handle(
        GetContentTagsQuery request,
        CancellationToken cancellationToken)
    {
        var list = await tags.Query()
            .Include(t => t.PostTags)
            .OrderBy(t => t.Name)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return Result<List<ContentTagResponse>>.Success(list.Select(t =>
            new ContentTagResponse(t.Id, t.Name, t.Slug, t.PostTags.Count)).ToList());
    }
}
