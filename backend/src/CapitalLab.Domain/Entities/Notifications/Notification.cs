using CapitalLab.Domain.Common;
using CapitalLab.Domain.Enums;

namespace CapitalLab.Domain.Entities.Notifications;

public class Notification : AuditableEntity
{
    public Guid UserId { get; private set; }
    public string Type { get; private set; } = string.Empty;
    public NotificationChannel Channel { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Message { get; private set; } = string.Empty;
    public string? PayloadJson { get; private set; }
    public NotificationStatus Status { get; private set; } = NotificationStatus.Pending;
    public DateTime? ScheduledAt { get; private set; }
    public DateTime? SentAt { get; private set; }
    public DateTime? ReadAt { get; private set; }

    public int RetryCount { get; private set; }
    public DateTime? LastAttemptAt { get; private set; }
    public DateTime? NextAttemptAt { get; private set; }
    public string? FailureReason { get; private set; }

    public ICollection<NotificationLog> Logs { get; private set; } = [];

    private Notification() { }

    public static Notification Create(
        Guid userId,
        string type,
        NotificationChannel channel,
        string title,
        string message,
        string? payloadJson = null,
        DateTime? scheduledAt = null)
    {
        return new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = type,
            Channel = channel,
            Title = title,
            Message = message,
            PayloadJson = payloadJson,
            Status = scheduledAt.HasValue ? NotificationStatus.Scheduled : NotificationStatus.Pending,
            ScheduledAt = scheduledAt
        };
    }

    public void MarkSent()
    {
        Status = NotificationStatus.Sent;
        SentAt = DateTime.UtcNow;
    }

    public void MarkFailed(string? reason = null)
    {
        Status = NotificationStatus.Failed;
        FailureReason = reason;
        LastAttemptAt = DateTime.UtcNow;
    }

    public bool CanRetry(int maxRetries = 5) => Status == NotificationStatus.Failed && RetryCount < maxRetries;

    public void ScheduleRetry()
    {
        RetryCount++;
        LastAttemptAt = DateTime.UtcNow;
        Status = NotificationStatus.Pending;

        NextAttemptAt = RetryCount switch
        {
            1 => DateTime.UtcNow.AddMinutes(5),
            2 => DateTime.UtcNow.AddMinutes(15),
            3 => DateTime.UtcNow.AddMinutes(30),
            4 => DateTime.UtcNow.AddMinutes(60),
            _ => null
        };
    }

    public void MarkPermanentlyFailed(string? reason = null)
    {
        Status = NotificationStatus.Failed;
        FailureReason = reason ?? FailureReason;
        NextAttemptAt = null;
    }

    public void MarkRead()
    {
        if (Status == NotificationStatus.Read) return;
        Status = NotificationStatus.Read;
        ReadAt = DateTime.UtcNow;
    }
}
