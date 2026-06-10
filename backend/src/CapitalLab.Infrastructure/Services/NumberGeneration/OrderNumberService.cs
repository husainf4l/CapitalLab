using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Infrastructure.Services.NumberGeneration;

public sealed class OrderNumberService(ApplicationDbContext db) : IOrderNumberService
{
    public async Task<string> GenerateNextAsync(DateOnly orderDate, CancellationToken cancellationToken = default)
    {
        var prefix = $"ORD-{orderDate:yyyyMMdd}-";
        var latest = await db.TestOrders
            .IgnoreQueryFilters()
            .Where(o => o.OrderNumber.StartsWith(prefix))
            .OrderByDescending(o => o.OrderNumber)
            .Select(o => o.OrderNumber)
            .FirstOrDefaultAsync(cancellationToken);

        var next = 1;
        if (latest is not null && int.TryParse(latest[prefix.Length..], out var parsed))
            next = parsed + 1;

        return $"{prefix}{next:D6}";
    }
}
