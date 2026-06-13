using CapitalLab.Domain.Common;
using CapitalLab.Domain.Enums;

namespace CapitalLab.Domain.Entities.Notifications;

public class NotificationTemplate : AuditableEntity
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string Subject { get; private set; } = string.Empty;
    public string Body { get; private set; } = string.Empty;
    public string? BodyAr { get; private set; }
    public NotificationChannel Channel { get; private set; }
    public bool IsActive { get; private set; } = true;

    private NotificationTemplate() { }

    public static NotificationTemplate Create(
        string code,
        string name,
        string subject,
        string body,
        NotificationChannel channel,
        string? bodyAr = null)
    {
        return new NotificationTemplate
        {
            Id = Guid.NewGuid(),
            Code = code,
            Name = name,
            Subject = subject,
            Body = body,
            BodyAr = bodyAr,
            Channel = channel
        };
    }

    public void Update(string name, string subject, string body, string? bodyAr)
    {
        Name = name;
        Subject = subject;
        Body = body;
        BodyAr = bodyAr;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
