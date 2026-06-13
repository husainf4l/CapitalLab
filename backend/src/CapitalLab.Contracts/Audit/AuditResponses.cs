namespace CapitalLab.Contracts.Audit;

public record AuditLogResponse(
    Guid Id,
    string EntityType,
    Guid EntityId,
    string Action,
    Guid? UserId,
    string? UserEmail,
    string? IpAddress,
    string? OldValues,
    string? NewValues,
    DateTime OccurredAt);
