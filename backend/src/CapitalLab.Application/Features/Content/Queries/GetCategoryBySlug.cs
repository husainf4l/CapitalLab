using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Content;
using CapitalLab.Domain.Entities.Content;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.Content.Queries;

public record GetCategoryBySlugQuery(string Slug) : IRequest<Result<ContentCategoryDetailResponse>>;

public class GetCategoryBySlugQueryHandler(
    IRepository<ContentCategory> categories,
    IRepository<ContentPost> posts)
    : IRequestHandler<GetCategoryBySlugQuery, Result<ContentCategoryDetailResponse>>
{
    public async Task<Result<ContentCategoryDetailResponse>> Handle(
        GetCategoryBySlugQuery req, CancellationToken ct)
    {
        var category = await categories.Query()
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Slug == req.Slug.ToLowerInvariant() && c.IsActive, ct);

        if (category is null)
            return Result<ContentCategoryDetailResponse>.Failure("NotFound", "Category not found.");

        var postCount = await posts.Query()
            .CountAsync(p => p.CategoryId == category.Id && p.IsPublished, ct);

        var baseQuery = posts.Query()
            .Include(p => p.Category)
            .Include(p => p.Author)
            .Include(p => p.PostTags).ThenInclude(pt => pt.Tag)
            .Where(p => p.CategoryId == category.Id && p.IsPublished)
            .AsNoTracking();

        var featuredPosts = await baseQuery
            .Where(p => p.IsFeatured)
            .OrderByDescending(p => p.PublishedAt ?? p.CreatedAt)
            .Take(3)
            .ToListAsync(ct);

        var recentPosts = await baseQuery
            .OrderByDescending(p => p.PublishedAt ?? p.CreatedAt)
            .Take(12)
            .ToListAsync(ct);

        return Result<ContentCategoryDetailResponse>.Success(new ContentCategoryDetailResponse(
            category.Id, category.NameEn, category.NameAr, category.Slug,
            category.Description, category.SortOrder, category.IsActive, postCount,
            featuredPosts.Select(GetContentPostsQueryHandler.ToSummary).ToList(),
            recentPosts.Select(GetContentPostsQueryHandler.ToSummary).ToList()));
    }
}
