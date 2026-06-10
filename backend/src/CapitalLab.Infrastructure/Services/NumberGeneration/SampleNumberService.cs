using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Infrastructure.Services.NumberGeneration;

public sealed class SampleNumberService(ApplicationDbContext db) : ISampleNumberService
{
    public async Task<string> GenerateNextAsync(DateOnly collectionDate, CancellationToken cancellationToken = default)
    {
        var prefix = $"SMP-{collectionDate:yyyyMMdd}-";
        var latest = await db.Samples
            .IgnoreQueryFilters()
            .Where(s => s.SampleNumber.StartsWith(prefix))
            .OrderByDescending(s => s.SampleNumber)
            .Select(s => s.SampleNumber)
            .FirstOrDefaultAsync(cancellationToken);

        var next = 1;
        if (latest is not null && int.TryParse(latest[prefix.Length..], out var parsed))
            next = parsed + 1;

        return $"{prefix}{next:D6}";
    }
}
