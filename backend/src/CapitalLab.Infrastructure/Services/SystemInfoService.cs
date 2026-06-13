using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Infrastructure.Services;

public class SystemInfoService(ApplicationDbContext db) : ISystemInfoService
{
    public async Task<string> GetLastMigrationAsync(CancellationToken ct = default)
    {
        try
        {
            var migrations = await db.Database.GetAppliedMigrationsAsync(ct);
            return migrations.LastOrDefault() ?? "none";
        }
        catch
        {
            return "unavailable";
        }
    }
}
