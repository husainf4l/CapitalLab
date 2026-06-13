using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Notifications;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ContractChannel = CapitalLab.Contracts.Enums.NotificationChannel;
using ContractStatus = CapitalLab.Contracts.Enums.NotificationStatus;
using DomainNotification = CapitalLab.Domain.Entities.Notifications.Notification;

namespace CapitalLab.Application.Features.Notifications.Queries;

public record GetNotificationsQuery(int PageNumber = 1, int PageSize = 20, bool UnreadOnly = false) : IRequest<Result<PagedResult<NotificationResponse>>>;

public class GetNotificationsQueryHandler(
    IRepository<DomainNotification> repo,
    ICurrentUserService currentUser) : IRequestHandler<GetNotificationsQuery, Result<PagedResult<NotificationResponse>>>
{
    public async Task<Result<PagedResult<NotificationResponse>>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        var query = repo.Query().Where(n => n.UserId == currentUser.UserId);

        if (request.UnreadOnly)
            query = query.Where(n => n.ReadAt == null);

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var mapped = items.Select(n => new NotificationResponse(
            n.Id, n.Type,
            (ContractChannel)(int)n.Channel,
            n.Title, n.Message,
            (ContractStatus)(int)n.Status,
            n.CreatedAt, n.SentAt, n.ReadAt)).ToList();

        return Result<PagedResult<NotificationResponse>>.Success(
            PagedResult<NotificationResponse>.Create(mapped, total, request.PageNumber, request.PageSize));
    }
}
