using Microsoft.Extensions.Logging;

namespace CapitalLab.Infrastructure.BackgroundJobs.Jobs;

/// <summary>
/// Runs daily at 06:00 UTC. Checks inventory stock levels and expiry dates.
/// Publishes low-stock and expiry alerts via notifications.
/// </summary>
public sealed class InventoryAlertsJob(ILogger<InventoryAlertsJob> logger)
{
    public async Task ExecuteAsync(CancellationToken cancellationToken = default)
    {
        logger.LogInformation("InventoryAlertsJob started at {UtcNow}", DateTime.UtcNow);

        // TODO Phase 9: inject IApplicationDbContext and INotificationService
        // var lowStock = await context.Stock
        //     .Include(s => s.Item)
        //     .Where(s => s.Quantity <= s.Item.ReorderLevel)
        //     .ToListAsync(cancellationToken);
        //
        // foreach (var item in lowStock)
        //     await notifications.SendAsync(NotificationEvents.LowStock, item.BranchId, item);
        //
        // var expiringItems = await context.Stock
        //     .Where(s => s.ExpiresAt != null && s.ExpiresAt <= DateOnly.FromDateTime(DateTime.UtcNow.AddDays(30)))
        //     .ToListAsync(cancellationToken);

        await Task.CompletedTask;
        logger.LogInformation("InventoryAlertsJob completed");
    }
}
