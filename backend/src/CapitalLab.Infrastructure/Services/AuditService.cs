using System.Text.Json;
using CapitalLab.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace CapitalLab.Infrastructure.Services;

/// <summary>
/// Writes audit log entries to the audit.audit_logs table.
/// Uses fire-and-forget with error swallowing — audit failures must NEVER block the main flow.
/// </summary>
public sealed class AuditService(
    ICurrentUserService currentUser,
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
            // TODO Phase 1: inject IApplicationDbContext and persist to audit.audit_logs
            // var log = new AuditLog
            // {
            //     EntityType    = entry.EntityType,
            //     EntityId      = entry.EntityId,
            //     Action        = entry.Action.ToString(),
            //     UserId        = currentUser.UserId,
            //     BranchId      = currentUser.BranchId,
            //     IpAddress     = currentUser.IpAddress,
            //     OldValues     = entry.OldValues is null ? null : JsonSerializer.Serialize(entry.OldValues, SerializerOptions),
            //     NewValues     = entry.NewValues is null ? null : JsonSerializer.Serialize(entry.NewValues, SerializerOptions),
            //     AdditionalData = entry.AdditionalData is null ? null : JsonSerializer.Serialize(entry.AdditionalData, SerializerOptions),
            //     OccurredAt    = DateTime.UtcNow
            // };
            // context.AuditLogs.Add(log);
            // await context.SaveChangesAsync(cancellationToken);

            logger.LogDebug(
                "Audit: {Action} {EntityType}/{EntityId} by {UserId}",
                entry.Action, entry.EntityType, entry.EntityId, currentUser.UserId);

            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            // Audit failures must not propagate — log and continue
            logger.LogError(ex,
                "Failed to write audit log for {Action} {EntityType}/{EntityId}",
                entry.Action, entry.EntityType, entry.EntityId);
        }
    }
}
