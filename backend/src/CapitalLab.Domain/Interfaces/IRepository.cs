using System.Linq.Expressions;
using CapitalLab.Domain.Common;

namespace CapitalLab.Domain.Interfaces;

/// <summary>
/// Generic repository contract. Only aggregate roots should be accessed directly.
/// Complex queries should use IQueryable via Query() or dedicated query methods.
/// </summary>
public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<List<T>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<List<T>> FindAsync(
        Expression<Func<T, bool>> predicate,
        CancellationToken cancellationToken = default);

    Task<T?> FirstOrDefaultAsync(
        Expression<Func<T, bool>> predicate,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(
        Expression<Func<T, bool>> predicate,
        CancellationToken cancellationToken = default);

    Task<int> CountAsync(
        Expression<Func<T, bool>> predicate,
        CancellationToken cancellationToken = default);

    Task AddAsync(T entity, CancellationToken cancellationToken = default);

    void Update(T entity);

    void Remove(T entity);

    /// <summary>Returns the queryable root for complex LINQ queries. Does NOT auto-include deleted records.</summary>
    IQueryable<T> Query();
}
