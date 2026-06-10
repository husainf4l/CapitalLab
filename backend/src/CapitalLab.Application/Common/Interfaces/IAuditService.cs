namespace CapitalLab.Application.Common.Interfaces;

public enum AuditAction { Create, Update, Delete, Read, Login, Logout, Export }

public record AuditEntry(
    string EntityType,
    Guid EntityId,
    AuditAction Action,
    object? OldValues = null,
    object? NewValues = null,
    object? AdditionalData = null);

public interface IAuditService
{
    Task LogAsync(AuditEntry entry, CancellationToken cancellationToken = default);
}
