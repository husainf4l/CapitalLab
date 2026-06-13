using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Content;
using CapitalLab.Domain.Entities.Content;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.Content.Queries;

public record GetContentAnalyticsQuery : IRequest<Result<ContentAnalyticsResponse>>;

public class GetContentAnalyticsQueryHandler(
    IRepository<ContentPost> posts,
    IRepository<ContentEvent> events,
    IRepository<ContentNewsletterSubscriber> subscribers,
    IRepository<ContentCategory> categories)
    : IRequestHandler<GetContentAnalyticsQuery, Result<ContentAnalyticsResponse>>
{
    public async Task<Result<ContentAnalyticsResponse>> Handle(
        GetContentAnalyticsQuery req, CancellationToken ct)
    {
        var now = DateTime.UtcNow;

        var totalPosts = await posts.Query().CountAsync(ct);
        var publishedPosts = await posts.Query().CountAsync(p => p.IsPublished, ct);
        var scheduledPosts = await posts.Query().CountAsync(p => !p.IsPublished && p.PublishAt.HasValue && p.PublishAt > now, ct);
        var draftPosts = totalPosts - publishedPosts - scheduledPosts;

        var totalEvents = await events.Query().CountAsync(ct);
        var upcomingEvents = await events.Query().CountAsync(e => e.EventDate >= now && e.IsPublished, ct);

        var totalViews = await posts.Query().SumAsync(p => (long)p.ViewCount, ct);

        var totalSubs = await subscribers.Query().CountAsync(ct);
        var activeSubs = await subscribers.Query().CountAsync(s => !s.IsUnsubscribed, ct);

        var topPosts = await posts.Query()
            .Include(p => p.Category)
            .Include(p => p.Author)
            .Include(p => p.PostTags).ThenInclude(pt => pt.Tag)
            .Where(p => p.IsPublished)
            .OrderByDescending(p => p.ViewCount)
            .Take(10)
            .AsNoTracking()
            .ToListAsync(ct);

        var topCategories = await categories.Query()
            .Include(c => c.Posts)
            .OrderByDescending(c => c.Posts.Count(p => p.IsPublished))
            .Take(5)
            .AsNoTracking()
            .Select(c => new ContentCategoryResponse(
                c.Id, c.NameEn, c.NameAr, c.Slug, c.Description, c.SortOrder, c.IsActive,
                c.Posts.Count(p => p.IsPublished)))
            .ToListAsync(ct);

        return Result<ContentAnalyticsResponse>.Success(new ContentAnalyticsResponse(
            totalPosts, publishedPosts, draftPosts, scheduledPosts,
            totalEvents, upcomingEvents,
            totalViews, totalSubs, activeSubs,
            topPosts.Select(GetContentPostsQueryHandler.ToSummary).ToList(),
            topCategories));
    }
}
