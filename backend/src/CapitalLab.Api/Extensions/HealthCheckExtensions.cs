using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace CapitalLab.Api.Extensions;

public static class HealthCheckExtensions
{
    public static IServiceCollection AddCapitalLabHealthChecks(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var hcBuilder = services.AddHealthChecks();

        // PostgreSQL
        var pgConn = configuration.GetConnectionString("DefaultConnection");
        if (!string.IsNullOrWhiteSpace(pgConn))
            hcBuilder.AddNpgSql(
                pgConn,
                name: "postgresql",
                tags: ["database", "ready"],
                failureStatus: HealthStatus.Unhealthy);

        // Redis
        var redisConn = configuration.GetConnectionString("Redis");
        if (!string.IsNullOrWhiteSpace(redisConn))
            hcBuilder.AddRedis(
                redisConn,
                name: "redis",
                tags: ["cache", "ready"],
                failureStatus: HealthStatus.Degraded);

        // Disk space (alert if free < 500MB)
        hcBuilder.AddDiskStorageHealthCheck(
            setup => setup.AddDrive("/", 500),
            name: "disk",
            tags: ["storage", "ready"],
            failureStatus: HealthStatus.Degraded);

        return services;
    }

    public static WebApplication MapCapitalLabHealthChecks(this WebApplication app)
    {
        app.MapHealthChecks("/health", new HealthCheckOptions
        {
            Predicate = _ => true,
            ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
        });

        app.MapHealthChecks("/health/ready", new HealthCheckOptions
        {
            Predicate = hc => hc.Tags.Contains("ready"),
            ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
        });

        app.MapHealthChecks("/health/live", new HealthCheckOptions
        {
            Predicate = _ => false,
            ResponseWriter = async (ctx, _) =>
            {
                ctx.Response.ContentType = "application/json";
                await ctx.Response.WriteAsync("{\"status\":\"alive\"}");
            }
        });

        return app;
    }
}
