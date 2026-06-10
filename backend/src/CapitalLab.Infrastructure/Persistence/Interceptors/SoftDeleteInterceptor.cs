using CapitalLab.Domain.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace CapitalLab.Infrastructure.Persistence.Interceptors;

/// <summary>
/// Converts hard deletes to soft deletes for all AuditableEntity subclasses.
/// Instead of removing the row, it sets DeletedAt and changes state to Modified.
/// Global query filters (configured per entity) exclude soft-deleted records from reads.
/// </summary>
public sealed class SoftDeleteInterceptor : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        ConvertDeletesToSoftDeletes(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        ConvertDeletesToSoftDeletes(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private static void ConvertDeletesToSoftDeletes(DbContext? context)
    {
        if (context is null) return;

        var deletedEntries = context.ChangeTracker
            .Entries<AuditableEntity>()
            .Where(e => e.State == EntityState.Deleted)
            .ToList();

        foreach (var entry in deletedEntries)
        {
            entry.State = EntityState.Modified;
            entry.Entity.SoftDelete(Guid.Empty);
        }
    }
}
