using MediatR;
using Microsoft.Extensions.Logging;

namespace CapitalLab.Application.Common.Behaviors;

/// <summary>
/// Logs a warning when a request takes longer than the configured threshold.
/// Default threshold: 500ms.
/// </summary>
public sealed class PerformanceBehavior<TRequest, TResponse>(
    ILogger<PerformanceBehavior<TRequest, TResponse>> logger,
    Interfaces.ICurrentUserService currentUser)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private const int SlowRequestThresholdMs = 500;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        var response = await next();
        stopwatch.Stop();

        if (stopwatch.ElapsedMilliseconds > SlowRequestThresholdMs)
        {
            logger.LogWarning(
                "CapitalLab slow request detected: {RequestName} | UserId: {UserId} | ElapsedMs: {ElapsedMs}ms (threshold: {Threshold}ms)",
                typeof(TRequest).Name,
                currentUser.UserId?.ToString() ?? "anonymous",
                stopwatch.ElapsedMilliseconds,
                SlowRequestThresholdMs);
        }

        return response;
    }
}
