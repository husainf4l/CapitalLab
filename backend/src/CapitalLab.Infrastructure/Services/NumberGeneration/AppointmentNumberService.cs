using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Infrastructure.Services.NumberGeneration;

public sealed class AppointmentNumberService(ApplicationDbContext db) : IAppointmentNumberService
{
    public async Task<string> GenerateNextAsync(DateOnly appointmentDate, CancellationToken cancellationToken = default)
    {
        var prefix = $"APT-{appointmentDate:yyyyMMdd}-";
        var latest = await db.Appointments
            .IgnoreQueryFilters()
            .Where(a => a.AppointmentNumber.StartsWith(prefix))
            .OrderByDescending(a => a.AppointmentNumber)
            .Select(a => a.AppointmentNumber)
            .FirstOrDefaultAsync(cancellationToken);

        var next = 1;
        if (latest is not null && int.TryParse(latest[prefix.Length..], out var parsed))
            next = parsed + 1;

        return $"{prefix}{next:D6}";
    }
}
