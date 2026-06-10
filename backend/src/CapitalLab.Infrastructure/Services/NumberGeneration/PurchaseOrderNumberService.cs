using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Infrastructure.Services.NumberGeneration;

public sealed class PurchaseOrderNumberService(ApplicationDbContext db) : IPurchaseOrderNumberService
{
    public async Task<string> GenerateNextAsync(DateOnly orderDate, CancellationToken cancellationToken = default)
    {
        var prefix = $"PO-{orderDate:yyyyMMdd}-";
        var latest = await db.PurchaseOrders
            .IgnoreQueryFilters()
            .Where(p => p.OrderNumber.StartsWith(prefix))
            .OrderByDescending(p => p.OrderNumber)
            .Select(p => p.OrderNumber)
            .FirstOrDefaultAsync(cancellationToken);

        var next = 1;
        if (latest is not null && int.TryParse(latest[prefix.Length..], out var parsed))
            next = parsed + 1;

        return $"{prefix}{next:D6}";
    }
}
