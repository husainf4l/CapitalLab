using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Content;
using CapitalLab.Domain.Entities.Content;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.Content.Queries;

public record SearchContentQuery(string Query, int Limit = 20)
    : IRequest<Result<List<ContentSearchResultResponse>>>;

public class SearchContentQueryHandler(
    IRepository<ContentPost> posts,
    IRepository<ContentEvent> events)
    : IRequestHandler<SearchContentQuery, Result<List<ContentSearchResultResponse>>>
{
    public async Task<Result<List<ContentSearchResultResponse>>> Handle(
        SearchContentQuery request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Query))
            return Result<List<ContentSearchResultResponse>>.Success([]);

        var q = request.Query.ToLowerInvariant();
        var take = Math.Clamp(request.Limit, 1, 50);

        var postResults = await posts.Query()
            .Where(p => p.IsPublished &&
                (p.TitleEn.ToLower().Contains(q) ||
                 p.TitleAr.ToLower().Contains(q) ||
                 (p.SummaryEn != null && p.SummaryEn.ToLower().Contains(q)) ||
                 (p.SummaryAr != null && p.SummaryAr.ToLower().Contains(q)) ||
                 (p.Keywords != null && p.Keywords.ToLower().Contains(q))))
            .OrderByDescending(p => p.PublishedAt ?? p.CreatedAt)
            .Take(take)
            .AsNoTracking()
            .Select(p => new ContentSearchResultResponse(
                p.Type.ToString(),
                p.Id, p.TitleEn, p.TitleAr, p.SummaryEn, p.Slug, p.ThumbnailUrl, p.PublishedAt))
            .ToListAsync(cancellationToken);

        var eventResults = await events.Query()
            .Where(e => e.IsPublished &&
                (e.TitleEn.ToLower().Contains(q) || e.TitleAr.ToLower().Contains(q)))
            .OrderByDescending(e => e.EventDate)
            .Take(take)
            .AsNoTracking()
            .Select(e => new ContentSearchResultResponse(
                "Event", e.Id, e.TitleEn, e.TitleAr, e.DescriptionEn, e.Slug, e.CoverImageUrl, e.EventDate))
            .ToListAsync(cancellationToken);

        var combined = postResults.Concat(eventResults)
            .OrderByDescending(r => r.PublishedAt)
            .Take(take)
            .ToList();

        return Result<List<ContentSearchResultResponse>>.Success(combined);
    }
}
