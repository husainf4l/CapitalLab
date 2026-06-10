using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Domain.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace CapitalLab.Infrastructure.Persistence.Interceptors;

/// <summary>
/// EF Core save interceptor that automatically populates CreatedAt, CreatedBy,
/// UpdatedAt, and UpdatedBy fields on AuditableEntity subclasses.
/// </summary>
public sealed class AuditableEntityInterceptor(ICurrentUserService currentUser) : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        UpdateAuditFields(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        UpdateAuditFields(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void UpdateAuditFields(DbContext? context)
    {
        if (context is null) return;

        var now = DateTime.UtcNow;
        var userId = currentUser.UserId;

        foreach (var entry in context.ChangeTracker.Entries<AuditableEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = now;
                    entry.Entity.UpdatedAt = now;
                    if (userId.HasValue)
                    {
                        entry.Entity.CreatedBy = userId;
                        entry.Entity.UpdatedBy = userId;
                    }
                    break;

                case EntityState.Modified:
                    entry.Entity.UpdatedAt = now;
                    if (userId.HasValue)
                        entry.Entity.UpdatedBy = userId;

                    // Prevent overwriting immutable audit fields
                    entry.Property(nameof(AuditableEntity.CreatedAt)).IsModified = false;
                    entry.Property(nameof(AuditableEntity.CreatedBy)).IsModified = false;
                    break;
            }
        }
    }
}
