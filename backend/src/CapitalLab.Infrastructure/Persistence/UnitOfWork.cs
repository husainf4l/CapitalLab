using CapitalLab.Domain.Interfaces;
using Microsoft.EntityFrameworkCore.Storage;

namespace CapitalLab.Infrastructure.Persistence;

/// <summary>
/// EF Core-backed Unit of Work. Wraps ApplicationDbContext transaction management.
/// Repositories are exposed as lazy-initialized properties, added per module.
/// </summary>
public sealed class UnitOfWork(ApplicationDbContext context) : IUnitOfWork
{
    private IDbContextTransaction? _transaction;
    private bool _disposed;

    public async Task<int> CommitAsync(CancellationToken cancellationToken = default) =>
        await context.SaveChangesAsync(cancellationToken);

    public async Task RollbackAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction is not null)
            await _transaction.RollbackAsync(cancellationToken);
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        _transaction = await context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction is null)
            throw new InvalidOperationException("No active transaction to commit.");

        await _transaction.CommitAsync(cancellationToken);
        await _transaction.DisposeAsync();
        _transaction = null;
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction is null) return;

        await _transaction.RollbackAsync(cancellationToken);
        await _transaction.DisposeAsync();
        _transaction = null;
    }

    public void Dispose()
    {
        if (_disposed) return;
        _transaction?.Dispose();
        context.Dispose();
        _disposed = true;
    }
}
