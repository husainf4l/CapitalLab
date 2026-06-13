using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Content;
using CapitalLab.Domain.Entities.Content;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.Content.Queries;

public record GetContentPostBySlugQuery(string Slug, bool AdminView = false)
    : IRequest<Result<ContentPostDetailResponse>>;

public class GetContentPostBySlugQueryHandler(IRepository<ContentPost> posts)
    : IRequestHandler<GetContentPostBySlugQuery, Result<ContentPostDetailResponse>>
{
    public async Task<Result<ContentPostDetailResponse>> Handle(
        GetContentPostBySlugQuery request,
        CancellationToken cancellationToken)
    {
        var query = posts.Query()
            .Include(p => p.Category)
            .Include(p => p.Author)
            .Include(p => p.PostTags).ThenInclude(pt => pt.Tag)
            .AsNoTracking();

        if (!request.AdminView)
            query = query.Where(p => p.IsPublished);

        var post = await query
            .FirstOrDefaultAsync(p => p.Slug == request.Slug.ToLowerInvariant(), cancellationToken);

        if (post is null)
            return Result<ContentPostDetailResponse>.Failure("NotFound", "Post not found.");

        // Related content engine: score by shared tags > same category > same author > recency
        var postTagIds = post.PostTags.Select(pt => pt.TagId).ToHashSet();

        var candidateQuery = posts.Query()
            .Include(p => p.Category)
            .Include(p => p.Author)
            .Include(p => p.PostTags).ThenInclude(pt => pt.Tag)
            .Where(p => p.IsPublished && p.Id != post.Id && p.Type == post.Type)
            .AsNoTracking();

        var candidates = await candidateQuery
            .OrderByDescending(p => p.ViewCount)
            .ThenByDescending(p => p.PublishedAt ?? p.CreatedAt)
            .Take(20)
            .ToListAsync(cancellationToken);

        var related = candidates
            .Select(p => new
            {
                Post = p,
                Score = (p.PostTags.Any(pt => postTagIds.Contains(pt.TagId)) ? 3 : 0)
                      + (post.CategoryId.HasValue && p.CategoryId == post.CategoryId ? 2 : 0)
                      + (post.AuthorId.HasValue && p.AuthorId == post.AuthorId ? 1 : 0)
            })
            .OrderByDescending(x => x.Score)
            .ThenByDescending(x => x.Post.ViewCount)
            .Take(3)
            .Select(x => x.Post)
            .ToList();

        var wordCount = post.ContentEn.Split([' ', '\n', '\r', '\t'], StringSplitOptions.RemoveEmptyEntries).Length;
        var readingTime = Math.Max(1, (int)Math.Ceiling(wordCount / 200.0));

        var response = new ContentPostDetailResponse(
            post.Id, (Contracts.Enums.ContentPostType)(int)post.Type,
            post.TitleEn, post.TitleAr,
            post.SummaryEn, post.SummaryAr,
            post.ContentEn, post.ContentAr,
            post.Slug,
            post.FeaturedImageUrl, post.ThumbnailUrl,
            post.MetaTitle, post.MetaDescription, post.Keywords,
            post.IsFeatured, post.IsPublished, post.PublishedAt, post.ExpiryDate,
            post.ViewCount, readingTime,
            post.CategoryId, post.Category?.NameEn, post.Category?.NameAr, post.Category?.Slug,
            post.AuthorId, post.Author?.FullName, post.Author?.JobTitle, post.Author?.Bio, post.Author?.ImageUrl,
            post.PostTags.Select(pt => new ContentTagResponse(pt.Tag.Id, pt.Tag.Name, pt.Tag.Slug, 0)).ToList(),
            related.Select(GetContentPostsQueryHandler.ToSummary).ToList(),
            post.CreatedAt, post.UpdatedAt);

        return Result<ContentPostDetailResponse>.Success(response);
    }
}
