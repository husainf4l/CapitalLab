using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;
using DomainNotification = CapitalLab.Domain.Entities.Notifications.Notification;

namespace CapitalLab.Application.Features.Notifications.Commands;

public record SendNotificationCommand(
    Guid UserId,
    string Type,
    NotificationChannel Channel,
    string Title,
    string Message,
    string? PayloadJson = null) : IRequest<Result>;

public class SendNotificationCommandHandler(
    INotificationService notificationService,
    ILogger<SendNotificationCommandHandler> logger) : IRequestHandler<SendNotificationCommand, Result>
{
    public async Task<Result> Handle(SendNotificationCommand request, CancellationToken cancellationToken)
    {
        await notificationService.SendAsync(new NotificationRequest(
            request.UserId,
            request.Type,
            request.Channel,
            request.Title,
            request.Message,
            request.PayloadJson), cancellationToken);

        logger.LogInformation("Notification sent: {Type} to user {UserId}", request.Type, request.UserId);
        return Result.Success();
    }
}
