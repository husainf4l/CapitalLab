using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Infrastructure.Services;

public sealed class PatientNumberService(ApplicationDbContext db) : IPatientNumberService
{
    public async Task<string> GenerateNextAsync(CancellationToken cancellationToken = default)
    {
        var max = await db.Patients
            .IgnoreQueryFilters()
            .Select(p => p.PatientNumber)
            .OrderByDescending(n => n)
            .FirstOrDefaultAsync(cancellationToken);

        int next = 1;
        if (max is not null && max.StartsWith("CAP-"))
        {
            var digits = max[4..];
            if (int.TryParse(digits, out var parsed))
                next = parsed + 1;
        }

        return $"CAP-{next:D6}";
    }
}
