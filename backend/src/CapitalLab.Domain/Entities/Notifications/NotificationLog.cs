using CapitalLab.Domain.Common;

namespace CapitalLab.Domain.Entities.Notifications;

public class NotificationLog : BaseEntity
{
    public Guid NotificationId { get; private set; }
    public string Provider { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;
    public string? Response { get; private set; }
    public DateTime SentAt { get; private set; }

    public Notification? Notification { get; private set; }

    private NotificationLog() { }

    public static NotificationLog Create(Guid notificationId, string provider, string status, string? response = null)
    {
        return new NotificationLog
        {
            Id = Guid.NewGuid(),
            NotificationId = notificationId,
            Provider = provider,
            Status = status,
            Response = response,
            SentAt = DateTime.UtcNow
        };
    }
}
