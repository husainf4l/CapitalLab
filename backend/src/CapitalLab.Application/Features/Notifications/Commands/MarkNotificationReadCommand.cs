using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Interfaces;
using MediatR;
using DomainNotification = CapitalLab.Domain.Entities.Notifications.Notification;

namespace CapitalLab.Application.Features.Notifications.Commands;

public record MarkNotificationReadCommand(Guid NotificationId) : IRequest<Result>;

public class MarkNotificationReadCommandHandler(
    IRepository<DomainNotification> repo,
    ICurrentUserService currentUser,
    IUnitOfWork uow) : IRequestHandler<MarkNotificationReadCommand, Result>
{
    public async Task<Result> Handle(MarkNotificationReadCommand request, CancellationToken cancellationToken)
    {
        var notification = await repo.FirstOrDefaultAsync(
            n => n.Id == request.NotificationId && n.UserId == currentUser.UserId,
            cancellationToken);

        if (notification is null)
            return Result.Failure("NOT_FOUND", "Notification not found.");

        notification.MarkRead();
        repo.Update(notification);
        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}
