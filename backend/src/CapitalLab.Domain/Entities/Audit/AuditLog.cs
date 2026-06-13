using CapitalLab.Domain.Common;

namespace CapitalLab.Domain.Entities.Audit;

public class AuditLog : BaseEntity
{
    public string EntityType { get; private set; } = string.Empty;
    public Guid EntityId { get; private set; }
    public string Action { get; private set; } = string.Empty;
    public Guid? UserId { get; private set; }
    public string? UserEmail { get; private set; }
    public string? IpAddress { get; private set; }
    public string? OldValues { get; private set; }
    public string? NewValues { get; private set; }
    public string? AdditionalData { get; private set; }
    public DateTime OccurredAt { get; private set; }

    private AuditLog() { }

    public static AuditLog Create(
        string entityType,
        Guid entityId,
        string action,
        Guid? userId = null,
        string? userEmail = null,
        string? ipAddress = null,
        string? oldValues = null,
        string? newValues = null,
        string? additionalData = null)
    {
        return new AuditLog
        {
            Id = Guid.NewGuid(),
            EntityType = entityType,
            EntityId = entityId,
            Action = action,
            UserId = userId,
            UserEmail = userEmail,
            IpAddress = ipAddress,
            OldValues = oldValues,
            NewValues = newValues,
            AdditionalData = additionalData,
            OccurredAt = DateTime.UtcNow
        };
    }
}
