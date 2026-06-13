using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using DomainNotification = CapitalLab.Domain.Entities.Notifications.Notification;

namespace CapitalLab.Application.Features.Notifications.Queries;

public record GetUnreadCountQuery : IRequest<Result<int>>;

public class GetUnreadCountQueryHandler(
    IRepository<DomainNotification> repo,
    ICurrentUserService currentUser) : IRequestHandler<GetUnreadCountQuery, Result<int>>
{
    public async Task<Result<int>> Handle(GetUnreadCountQuery request, CancellationToken cancellationToken)
    {
        var count = await repo.Query()
            .Where(n => n.UserId == currentUser.UserId && n.ReadAt == null)
            .CountAsync(cancellationToken);

        return Result<int>.Success(count);
    }
}
