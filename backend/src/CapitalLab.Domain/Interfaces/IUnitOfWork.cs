namespace CapitalLab.Domain.Interfaces;

/// <summary>
/// Unit of Work pattern. Wraps a single transaction boundary.
/// Domain events are dispatched inside CommitAsync after all changes are persisted.
/// </summary>
public interface IUnitOfWork : IDisposable
{
    Task<int> CommitAsync(CancellationToken cancellationToken = default);

    Task RollbackAsync(CancellationToken cancellationToken = default);

    Task BeginTransactionAsync(CancellationToken cancellationToken = default);

    Task CommitTransactionAsync(CancellationToken cancellationToken = default);

    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}
