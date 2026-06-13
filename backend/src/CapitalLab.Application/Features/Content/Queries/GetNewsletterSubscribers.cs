using CapitalLab.Application.Common.Extensions;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Content;
using CapitalLab.Domain.Entities.Content;
using CapitalLab.Domain.Interfaces;
using MediatR;

namespace CapitalLab.Application.Features.Content.Queries;

public record GetNewsletterSubscribersQuery(
    PaginationRequest Pagination,
    bool? Unsubscribed = null)
    : IRequest<Result<PagedResult<NewsletterSubscriberResponse>>>;

public class GetNewsletterSubscribersQueryHandler(IRepository<ContentNewsletterSubscriber> repo)
    : IRequestHandler<GetNewsletterSubscribersQuery, Result<PagedResult<NewsletterSubscriberResponse>>>
{
    public async Task<Result<PagedResult<NewsletterSubscriberResponse>>> Handle(
        GetNewsletterSubscribersQuery req, CancellationToken ct)
    {
        var query = repo.Query();

        if (req.Unsubscribed.HasValue)
            query = query.Where(s => s.IsUnsubscribed == req.Unsubscribed.Value);

        if (!string.IsNullOrWhiteSpace(req.Pagination.Search))
        {
            var s = req.Pagination.Search.ToLowerInvariant();
            query = query.Where(sub => sub.Email.Contains(s));
        }

        query = query.OrderByDescending(s => s.CreatedAt);

        var paged = await query.ToPagedResultAsync(req.Pagination, ct);

        return Result<PagedResult<NewsletterSubscriberResponse>>.Success(
            paged.Map(s => new NewsletterSubscriberResponse(
                s.Id, s.Email, s.Language, s.IsConfirmed, s.IsUnsubscribed, s.CreatedAt)));
    }
}
