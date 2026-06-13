using CapitalLab.Application.Common.Extensions;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Content;
using CapitalLab.Domain.Entities.Content;
using DomainEnums = CapitalLab.Domain.Enums;
using ContractsEnums = CapitalLab.Contracts.Enums;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.Content.Queries;

public record GetContentPostsQuery(
    PaginationRequest Pagination,
    ContractsEnums.ContentPostType? Type = null,
    Guid? CategoryId = null,
    bool? IsFeatured = null,
    bool PublishedOnly = true) : IRequest<Result<PagedResult<ContentPostSummaryResponse>>>;

public class GetContentPostsQueryHandler(IRepository<ContentPost> posts)
    : IRequestHandler<GetContentPostsQuery, Result<PagedResult<ContentPostSummaryResponse>>>
{
    public async Task<Result<PagedResult<ContentPostSummaryResponse>>> Handle(
        GetContentPostsQuery request,
        CancellationToken cancellationToken)
    {
        var query = posts.Query()
            .Include(p => p.Category)
            .Include(p => p.Author)
            .Include(p => p.PostTags).ThenInclude(pt => pt.Tag)
            .AsNoTracking();

        if (request.PublishedOnly)
        {
            query = query.Where(p => p.IsPublished);
            query = query.Where(p => p.ExpiryDate == null || p.ExpiryDate > DateTime.UtcNow);
        }

        if (request.Type.HasValue)
            query = query.Where(p => p.Type == (DomainEnums.ContentPostType)(int)request.Type.Value);

        if (request.CategoryId.HasValue)
            query = query.Where(p => p.CategoryId == request.CategoryId.Value);

        if (request.IsFeatured.HasValue)
            query = query.Where(p => p.IsFeatured == request.IsFeatured.Value);

        if (!string.IsNullOrWhiteSpace(request.Pagination.Search))
        {
            var search = request.Pagination.Search.ToLowerInvariant();
            query = query.Where(p =>
                p.TitleEn.ToLower().Contains(search) ||
                p.TitleAr.ToLower().Contains(search) ||
                (p.SummaryEn != null && p.SummaryEn.ToLower().Contains(search)) ||
                (p.SummaryAr != null && p.SummaryAr.ToLower().Contains(search)));
        }

        query = query.OrderByDescending(p => p.IsFeatured)
                     .ThenByDescending(p => p.PublishedAt ?? p.CreatedAt);

        var paged = await query.ToPagedResultAsync(request.Pagination, cancellationToken);

        return Result<PagedResult<ContentPostSummaryResponse>>.Success(
            paged.Map(ToSummary));
    }

    internal static ContentPostSummaryResponse ToSummary(ContentPost p) => new(
        p.Id,
        (ContractsEnums.ContentPostType)(int)p.Type,
        p.TitleEn, p.TitleAr,
        p.SummaryEn, p.SummaryAr,
        p.Slug,
        p.ThumbnailUrl, p.FeaturedImageUrl,
        p.IsFeatured, p.IsPublished, p.PublishedAt,
        p.ViewCount,
        EstimateReadingTime(p.ContentEn),
        p.Category?.NameEn, p.Category?.NameAr, p.Category?.Slug,
        p.Author?.FullName, p.Author?.ImageUrl,
        p.PostTags.Select(pt => pt.Tag.Name).ToList());

    private static int EstimateReadingTime(string content)
    {
        var wordCount = content.Split([' ', '\n', '\r', '\t'], StringSplitOptions.RemoveEmptyEntries).Length;
        return Math.Max(1, (int)Math.Ceiling(wordCount / 200.0));
    }
}
