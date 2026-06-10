using Microsoft.Extensions.Logging;

namespace CapitalLab.Infrastructure.BackgroundJobs.Jobs;

/// <summary>
/// Runs every 15 minutes. Sends reminder notifications for appointments
/// scheduled 24 hours and 2 hours from now.
/// </summary>
public sealed class AppointmentReminderJob(ILogger<AppointmentReminderJob> logger)
{
    public async Task ExecuteAsync(CancellationToken cancellationToken = default)
    {
        logger.LogInformation("AppointmentReminderJob started at {UtcNow}", DateTime.UtcNow);

        // TODO Phase 5: inject IApplicationDbContext and INotificationService
        // var now = DateTime.UtcNow;
        // var windows = new[] { TimeSpan.FromHours(24), TimeSpan.FromHours(2) };
        // foreach (var window in windows)
        // {
        //     var target = now.Add(window);
        //     var from = target.AddMinutes(-7);
        //     var to = target.AddMinutes(7);
        //     var appointments = await context.Appointments
        //         .Where(a => a.Status == AppointmentStatus.Confirmed
        //                  && a.ScheduledAt >= from && a.ScheduledAt <= to)
        //         .Include(a => a.Patient)
        //         .ToListAsync(cancellationToken);
        //     foreach (var apt in appointments)
        //         await notifications.SendReminderAsync(apt);
        // }

        await Task.CompletedTask;
        logger.LogInformation("AppointmentReminderJob completed");
    }
}
