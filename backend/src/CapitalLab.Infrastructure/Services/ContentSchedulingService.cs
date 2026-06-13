using CapitalLab.Domain.Entities.Content;
using CapitalLab.Domain.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Infrastructure.Services;

public class ContentSchedulingService(
    IServiceScopeFactory scopeFactory,
    ILogger<ContentSchedulingService> logger)
    : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(1);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await ProcessScheduledPostsAsync(stoppingToken);
            await Task.Delay(Interval, stoppingToken);
        }
    }

    private async Task ProcessScheduledPostsAsync(CancellationToken ct)
    {
        using var scope = scopeFactory.CreateScope();
        var posts = scope.ServiceProvider.GetRequiredService<IRepository<ContentPost>>();
        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var now = DateTime.UtcNow;

        // Auto-publish scheduled posts
        var toPublish = await posts.Query()
            .Where(p => !p.IsPublished && p.PublishAt.HasValue && p.PublishAt <= now)
            .ToListAsync(ct);

        foreach (var post in toPublish)
        {
            post.AutoPublish();
            logger.LogInformation("Auto-published post '{Slug}' (scheduled for {PublishAt})",
                post.Slug, post.PublishAt);
        }

        // Auto-expire posts past their expiry date
        var toExpire = await posts.Query()
            .Where(p => p.IsPublished && p.ExpiryDate.HasValue && p.ExpiryDate <= now)
            .ToListAsync(ct);

        foreach (var post in toExpire)
        {
            post.AutoExpire();
            logger.LogInformation("Auto-expired post '{Slug}' (expired at {ExpiryDate})",
                post.Slug, post.ExpiryDate);
        }

        if (toPublish.Count > 0 || toExpire.Count > 0)
            await uow.CommitAsync(ct);
    }
}
