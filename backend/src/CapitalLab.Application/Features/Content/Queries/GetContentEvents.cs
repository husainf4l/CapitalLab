using CapitalLab.Application.Common.Extensions;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Content;
using CapitalLab.Domain.Entities.Content;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.Content.Queries;

// ── List events ───────────────────────────────────────────────────────────────

public record GetContentEventsQuery(
    PaginationRequest Pagination,
    bool? Upcoming = null,
    bool PublishedOnly = true) : IRequest<Result<PagedResult<ContentEventSummaryResponse>>>;

public class GetContentEventsQueryHandler(IRepository<ContentEvent> events)
    : IRequestHandler<GetContentEventsQuery, Result<PagedResult<ContentEventSummaryResponse>>>
{
    public async Task<Result<PagedResult<ContentEventSummaryResponse>>> Handle(
        GetContentEventsQuery request,
        CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var query = events.Query().AsNoTracking();

        if (request.PublishedOnly)
            query = query.Where(e => e.IsPublished);

        if (request.Upcoming == true)
            query = query.Where(e => e.EventDate >= now);
        else if (request.Upcoming == false)
            query = query.Where(e => e.EventDate < now);

        if (!string.IsNullOrWhiteSpace(request.Pagination.Search))
        {
            var s = request.Pagination.Search.ToLowerInvariant();
            query = query.Where(e => e.TitleEn.ToLower().Contains(s) || e.TitleAr.ToLower().Contains(s));
        }

        query = request.Upcoming == false
            ? query.OrderByDescending(e => e.EventDate)
            : query.OrderBy(e => e.EventDate);

        var paged = await query.ToPagedResultAsync(request.Pagination, cancellationToken);

        return Result<PagedResult<ContentEventSummaryResponse>>.Success(
            paged.Map(e => ToSummary(e, now)));
    }

    internal static ContentEventSummaryResponse ToSummary(ContentEvent e, DateTime now) => new(
        e.Id, e.TitleEn, e.TitleAr,
        e.DescriptionEn, e.DescriptionAr,
        e.Slug, e.EventDate, e.EndDate, e.Location,
        e.CoverImageUrl, e.RegistrationUrl,
        e.IsPublished, e.EventDate >= now, e.ViewCount);
}

// ── Single event by slug ──────────────────────────────────────────────────────

public record GetContentEventBySlugQuery(string Slug, bool AdminView = false)
    : IRequest<Result<ContentEventDetailResponse>>;

public class GetContentEventBySlugQueryHandler(IRepository<ContentEvent> events)
    : IRequestHandler<GetContentEventBySlugQuery, Result<ContentEventDetailResponse>>
{
    public async Task<Result<ContentEventDetailResponse>> Handle(
        GetContentEventBySlugQuery request,
        CancellationToken cancellationToken)
    {
        var query = events.Query().AsNoTracking();

        if (!request.AdminView)
            query = query.Where(e => e.IsPublished);

        var ev = await query
            .FirstOrDefaultAsync(e => e.Slug == request.Slug.ToLowerInvariant(), cancellationToken);

        if (ev is null)
            return Result<ContentEventDetailResponse>.Failure("NotFound", "Event not found.");

        var now = DateTime.UtcNow;
        return Result<ContentEventDetailResponse>.Success(new(
            ev.Id, ev.TitleEn, ev.TitleAr,
            ev.DescriptionEn, ev.DescriptionAr,
            ev.Slug, ev.EventDate, ev.EndDate, ev.Location,
            ev.CoverImageUrl, ev.RegistrationUrl,
            ev.MetaTitle, ev.MetaDescription,
            ev.IsPublished, ev.EventDate >= now, ev.ViewCount, ev.CreatedAt));
    }
}
