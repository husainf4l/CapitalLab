using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace CapitalLab.Application.Common.Behaviors;

/// <summary>
/// Opt-in transaction wrapper for commands that implement ITransactionalRequest.
/// Wraps the entire handler in a DB transaction; rolls back on exception.
/// Queries should NOT implement ITransactionalRequest.
/// </summary>
public interface ITransactionalRequest;

public sealed class TransactionBehavior<TRequest, TResponse>(
    IUnitOfWork unitOfWork,
    ILogger<TransactionBehavior<TRequest, TResponse>> logger)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (request is not ITransactionalRequest)
            return await next();

        var requestName = typeof(TRequest).Name;

        logger.LogDebug("Beginning transaction for {RequestName}", requestName);

        await unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            var response = await next();
            await unitOfWork.CommitTransactionAsync(cancellationToken);

            logger.LogDebug("Committed transaction for {RequestName}", requestName);

            return response;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Rolling back transaction for {RequestName}", requestName);
            await unitOfWork.RollbackTransactionAsync(cancellationToken);
            throw;
        }
    }
}
