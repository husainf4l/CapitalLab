using MediatR;
using Microsoft.Extensions.Logging;

namespace CapitalLab.Application.Common.Behaviors;

/// <summary>
/// MediatR pipeline behavior that logs every command/query with execution time.
/// Logs at Information level for commands and Debug for queries.
/// </summary>
public sealed class LoggingBehavior<TRequest, TResponse>(
    ILogger<LoggingBehavior<TRequest, TResponse>> logger,
    Interfaces.ICurrentUserService currentUser)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        var userId = currentUser.UserId?.ToString() ?? "anonymous";
        var isCommand = requestName.EndsWith("Command", StringComparison.OrdinalIgnoreCase);

        if (isCommand)
            logger.LogInformation(
                "CapitalLab Command: {RequestName} | UserId: {UserId}",
                requestName, userId);
        else
            logger.LogDebug(
                "CapitalLab Query: {RequestName} | UserId: {UserId}",
                requestName, userId);

        var stopwatch = System.Diagnostics.Stopwatch.StartNew();

        try
        {
            var response = await next();
            stopwatch.Stop();

            logger.LogDebug(
                "CapitalLab {RequestType} handled: {RequestName} | ElapsedMs: {ElapsedMs}",
                isCommand ? "Command" : "Query", requestName, stopwatch.ElapsedMilliseconds);

            return response;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            logger.LogError(ex,
                "CapitalLab {RequestType} failed: {RequestName} | UserId: {UserId} | ElapsedMs: {ElapsedMs}",
                isCommand ? "Command" : "Query", requestName, userId, stopwatch.ElapsedMilliseconds);
            throw;
        }
    }
}
