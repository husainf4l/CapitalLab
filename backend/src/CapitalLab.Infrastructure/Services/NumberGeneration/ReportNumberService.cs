using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Infrastructure.Services.NumberGeneration;

public sealed class ReportNumberService(ApplicationDbContext db) : IReportNumberService
{
    public async Task<string> GenerateNextAsync(DateOnly reportDate, CancellationToken cancellationToken = default)
    {
        var prefix = $"REP-{reportDate:yyyyMMdd}-";
        var latest = await db.Reports
            .IgnoreQueryFilters()
            .Where(r => r.ReportNumber.StartsWith(prefix))
            .OrderByDescending(r => r.ReportNumber)
            .Select(r => r.ReportNumber)
            .FirstOrDefaultAsync(cancellationToken);

        var next = 1;
        if (latest is not null && int.TryParse(latest[prefix.Length..], out var parsed))
            next = parsed + 1;

        return $"{prefix}{next:D6}";
    }
}
