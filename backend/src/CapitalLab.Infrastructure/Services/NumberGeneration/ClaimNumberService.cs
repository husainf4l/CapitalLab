using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Infrastructure.Services.NumberGeneration;

public sealed class ClaimNumberService(ApplicationDbContext db) : IClaimNumberService
{
    public async Task<string> GenerateNextAsync(DateOnly claimDate, CancellationToken cancellationToken = default)
    {
        var prefix = $"CLM-{claimDate:yyyyMMdd}-";
        var latest = await db.InsuranceClaims
            .IgnoreQueryFilters()
            .Where(c => c.ClaimNumber.StartsWith(prefix))
            .OrderByDescending(c => c.ClaimNumber)
            .Select(c => c.ClaimNumber)
            .FirstOrDefaultAsync(cancellationToken);

        var next = 1;
        if (latest is not null && int.TryParse(latest[prefix.Length..], out var parsed))
            next = parsed + 1;

        return $"{prefix}{next:D6}";
    }
}
