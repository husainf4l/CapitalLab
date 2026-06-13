using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Domain.Entities.Notifications;
using CapitalLab.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CapitalLab.Infrastructure.BackgroundJobs.Jobs;

/// <summary>
/// Retries failed notifications using a graduated back-off schedule.
/// Retry windows: 5 min → 15 min → 30 min → 60 min → permanent failure.
/// </summary>
public sealed class NotificationRetryJob(
    IRepository<Notification> repo,
    IUnitOfWork uow,
    INotificationService notificationService,
    ILogger<NotificationRetryJob> logger)
{
    private const int MaxRetries = 5;

    public async Task ExecuteAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        var due = await repo
            .Query()
            .Where(n => n.Status == Domain.Enums.NotificationStatus.Pending
                        && n.RetryCount > 0
                        && n.NextAttemptAt != null
                        && n.NextAttemptAt <= now
                        && n.RetryCount < MaxRetries)
            .Take(100)
            .ToListAsync(cancellationToken);

        if (due.Count == 0)
        {
            logger.LogDebug("NotificationRetryJob: nothing to retry");
            return;
        }

        logger.LogInformation("NotificationRetryJob: retrying {Count} notifications", due.Count);

        foreach (var notification in due)
        {
            try
            {
                await notificationService.SendAsync(new NotificationRequest(
                    notification.UserId,
                    notification.Type,
                    notification.Channel,
                    notification.Title,
                    notification.Message,
                    notification.PayloadJson), cancellationToken);

                logger.LogInformation(
                    "NotificationRetryJob: {Id} retry #{Attempt} succeeded", notification.Id, notification.RetryCount);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "NotificationRetryJob: {Id} retry #{Attempt} failed", notification.Id, notification.RetryCount);

                if (!notification.CanRetry(MaxRetries))
                    notification.MarkPermanentlyFailed(ex.Message);
                else
                    notification.MarkFailed(ex.Message);
            }
        }

        await uow.CommitAsync(cancellationToken);
    }
}
