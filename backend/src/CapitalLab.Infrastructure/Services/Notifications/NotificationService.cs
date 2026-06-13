using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Domain.Entities.Notifications;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using DomainNotification = CapitalLab.Domain.Entities.Notifications.Notification;

namespace CapitalLab.Infrastructure.Services.Notifications;

public sealed class NotificationService(
    IRepository<DomainNotification> repo,
    IRepository<NotificationLog> logRepo,
    IUnitOfWork uow,
    IEmailService emailService,
    ISmsService smsService,
    IWhatsAppService whatsAppService,
    IPushNotificationService pushService,
    ILogger<NotificationService> logger) : INotificationService
{
    public async Task SendAsync(NotificationRequest request, CancellationToken cancellationToken = default)
    {
        var notification = DomainNotification.Create(
            request.UserId, request.Type, request.Channel,
            request.Title, request.Message, request.PayloadJson, request.ScheduledAt);

        await repo.AddAsync(notification, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        await DispatchAsync(notification, cancellationToken);
    }

    public async Task SendMultiChannelAsync(Guid userId, string type, string title, string message,
        IEnumerable<NotificationChannel> channels, CancellationToken cancellationToken = default)
    {
        foreach (var channel in channels)
            await SendAsync(new NotificationRequest(userId, type, channel, title, message), cancellationToken);
    }

    public async Task SendToRoleAsync(string role, string type, string title, string message,
        NotificationChannel channel, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("Broadcast notification to role {Role}: {Title}", role, title);
        await Task.CompletedTask;
    }

    private async Task DispatchAsync(DomainNotification notification, CancellationToken ct)
    {
        string provider = notification.Channel.ToString();
        string status = "sent";
        string? response = null;

        try
        {
            switch (notification.Channel)
            {
                case NotificationChannel.Email:
                    await emailService.SendAsync("", notification.Title, notification.Message, cancellationToken: ct);
                    break;
                case NotificationChannel.SMS:
                    await smsService.SendAsync("", notification.Message, ct);
                    break;
                case NotificationChannel.WhatsApp:
                    await whatsAppService.SendAsync("", notification.Message, ct);
                    break;
                case NotificationChannel.Push:
                    await pushService.SendToUserAsync(notification.UserId, notification.Title, notification.Message, cancellationToken: ct);
                    break;
                case NotificationChannel.InApp:
                    break;
            }

            notification.MarkSent();
        }
        catch (Exception ex)
        {
            status = "failed";
            response = ex.Message;
            notification.MarkFailed(ex.Message);
            if (notification.CanRetry())
                notification.ScheduleRetry();
            logger.LogError(ex, "Failed to dispatch {Channel} notification {Id}", notification.Channel, notification.Id);
        }

        var log = NotificationLog.Create(notification.Id, provider, status, response);
        await logRepo.AddAsync(log, ct);
        await uow.CommitAsync(ct);
    }
}
