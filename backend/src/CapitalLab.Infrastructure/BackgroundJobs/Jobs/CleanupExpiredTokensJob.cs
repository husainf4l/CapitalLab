using Microsoft.Extensions.Logging;

namespace CapitalLab.Infrastructure.BackgroundJobs.Jobs;

/// <summary>
/// Runs daily at 02:00 UTC. Purges refresh tokens that have expired or been used.
/// Prevents the refresh_tokens table from growing unbounded.
/// </summary>
public sealed class CleanupExpiredTokensJob(ILogger<CleanupExpiredTokensJob> logger)
{
    public async Task ExecuteAsync(CancellationToken cancellationToken = default)
    {
        logger.LogInformation("CleanupExpiredTokensJob started at {UtcNow}", DateTime.UtcNow);

        // TODO Phase 1: inject IApplicationDbContext and run:
        // var cutoff = DateTime.UtcNow;
        // var deleted = await context.RefreshTokens
        //     .Where(t => t.ExpiresAt < cutoff || t.UsedAt != null || t.RevokedAt != null)
        //     .ExecuteDeleteAsync(cancellationToken);
        // logger.LogInformation("Cleaned up {Count} expired refresh tokens", deleted);

        await Task.CompletedTask;
        logger.LogInformation("CleanupExpiredTokensJob completed");
    }
}
