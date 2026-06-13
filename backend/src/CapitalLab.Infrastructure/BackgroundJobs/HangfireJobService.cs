using CapitalLab.Infrastructure.BackgroundJobs.Jobs;
using Hangfire;
using Microsoft.Extensions.Logging;

namespace CapitalLab.Infrastructure.BackgroundJobs;

/// <summary>
/// Registers all recurring Hangfire jobs on application startup.
/// Job schedules use CRON expressions in UTC.
/// </summary>
public static class HangfireJobService
{
    public static void RegisterRecurringJobs(ILogger logger)
    {
        logger.LogInformation("Registering Hangfire recurring jobs");

        // Daily at 02:00 UTC
        RecurringJob.AddOrUpdate<CleanupExpiredTokensJob>(
            "cleanup-expired-tokens",
            job => job.ExecuteAsync(CancellationToken.None),
            "0 2 * * *",
            new RecurringJobOptions { TimeZone = TimeZoneInfo.Utc });

        // Every 15 minutes
        RecurringJob.AddOrUpdate<AppointmentReminderJob>(
            "appointment-reminders",
            job => job.ExecuteAsync(CancellationToken.None),
            "*/15 * * * *",
            new RecurringJobOptions { TimeZone = TimeZoneInfo.Utc });

        // Every 5 minutes — retry failed notifications
        RecurringJob.AddOrUpdate<NotificationRetryJob>(
            "notification-retry",
            job => job.ExecuteAsync(CancellationToken.None),
            "*/5 * * * *",
            new RecurringJobOptions { TimeZone = TimeZoneInfo.Utc });

        logger.LogInformation("Hangfire recurring jobs registered successfully");
    }
}
