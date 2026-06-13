using System.Text.Json;
using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Domain.Entities.Audit;
using CapitalLab.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace CapitalLab.Infrastructure.Services;

public sealed class AuditService(
    ICurrentUserService currentUser,
    IRepository<AuditLog> repo,
    IUnitOfWork uow,
    ILogger<AuditService> logger) : IAuditService
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        WriteIndented = false,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public async Task LogAsync(AuditEntry entry, CancellationToken cancellationToken = default)
    {
        try
        {
            var log = AuditLog.Create(
                entry.EntityType,
                entry.EntityId,
                entry.Action.ToString(),
                currentUser.UserId,
                currentUser.Email,
                currentUser.IpAddress,
                entry.OldValues is null ? null : JsonSerializer.Serialize(entry.OldValues, SerializerOptions),
                entry.NewValues is null ? null : JsonSerializer.Serialize(entry.NewValues, SerializerOptions),
                entry.AdditionalData is null ? null : JsonSerializer.Serialize(entry.AdditionalData, SerializerOptions));

            await repo.AddAsync(log, cancellationToken);
            await uow.CommitAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex,
                "Failed to write audit log for {Action} {EntityType}/{EntityId}",
                entry.Action, entry.EntityType, entry.EntityId);
        }
    }
}
