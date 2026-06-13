using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Content;
using CapitalLab.Domain.Entities.Content;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ContractsEnums = CapitalLab.Contracts.Enums;

namespace CapitalLab.Application.Features.Content.Queries;

public record GetPopularPostsQuery(int Limit = 5, ContractsEnums.ContentPostType? Type = null)
    : IRequest<Result<List<ContentPostSummaryResponse>>>;

public class GetPopularPostsQueryHandler(IRepository<ContentPost> posts)
    : IRequestHandler<GetPopularPostsQuery, Result<List<ContentPostSummaryResponse>>>
{
    public async Task<Result<List<ContentPostSummaryResponse>>> Handle(
        GetPopularPostsQuery req, CancellationToken ct)
    {
        var limit = Math.Clamp(req.Limit, 1, 20);
        var now = DateTime.UtcNow;

        var query = posts.Query()
            .Include(p => p.Category)
            .Include(p => p.Author)
            .Include(p => p.PostTags).ThenInclude(pt => pt.Tag)
            .Where(p => p.IsPublished && (p.ExpiryDate == null || p.ExpiryDate > now))
            .AsNoTracking();

        if (req.Type.HasValue)
            query = query.Where(p => p.Type == (CapitalLab.Domain.Enums.ContentPostType)(int)req.Type.Value);

        var result = await query
            .OrderByDescending(p => p.ViewCount)
            .ThenByDescending(p => p.PublishedAt ?? p.CreatedAt)
            .Take(limit)
            .ToListAsync(ct);

        return Result<List<ContentPostSummaryResponse>>.Success(
            result.Select(GetContentPostsQueryHandler.ToSummary).ToList());
    }
}
