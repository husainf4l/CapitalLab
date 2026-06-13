using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Content;
using CapitalLab.Domain.Entities.Content;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.Content.Queries;

public record GetFaqItemsQuery(bool ActiveOnly = true, string? Category = null)
    : IRequest<Result<List<ContentFaqItemResponse>>>;

public class GetFaqItemsQueryHandler(IRepository<ContentFaqItem> repo)
    : IRequestHandler<GetFaqItemsQuery, Result<List<ContentFaqItemResponse>>>
{
    public async Task<Result<List<ContentFaqItemResponse>>> Handle(
        GetFaqItemsQuery req, CancellationToken ct)
    {
        var query = repo.Query().AsNoTracking();

        if (req.ActiveOnly)
            query = query.Where(f => f.IsActive);

        if (!string.IsNullOrWhiteSpace(req.Category))
            query = query.Where(f => f.Category == req.Category);

        var items = await query
            .OrderBy(f => f.SortOrder)
            .ThenBy(f => f.CreatedAt)
            .Select(f => new ContentFaqItemResponse(
                f.Id, f.QuestionEn, f.QuestionAr,
                f.AnswerEn, f.AnswerAr,
                f.Category, f.SortOrder, f.IsActive))
            .ToListAsync(ct);

        return Result<List<ContentFaqItemResponse>>.Success(items);
    }
}
