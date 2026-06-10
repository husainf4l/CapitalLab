using System.Linq.Expressions;
using CapitalLab.Domain.Common;
using CapitalLab.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Infrastructure.Persistence.Repositories;

/// <summary>
/// Generic EF Core repository implementation.
/// All queries automatically filter out soft-deleted records via global query filters.
/// </summary>
public class GenericRepository<T>(ApplicationDbContext context) : IRepository<T>
    where T : BaseEntity
{
    protected readonly DbSet<T> DbSet = context.Set<T>();

    public virtual async Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await DbSet.FindAsync([id], cancellationToken);

    public virtual async Task<List<T>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await DbSet.ToListAsync(cancellationToken);

    public virtual async Task<List<T>> FindAsync(
        Expression<Func<T, bool>> predicate,
        CancellationToken cancellationToken = default) =>
        await DbSet.Where(predicate).ToListAsync(cancellationToken);

    public virtual async Task<T?> FirstOrDefaultAsync(
        Expression<Func<T, bool>> predicate,
        CancellationToken cancellationToken = default) =>
        await DbSet.FirstOrDefaultAsync(predicate, cancellationToken);

    public virtual async Task<bool> ExistsAsync(
        Expression<Func<T, bool>> predicate,
        CancellationToken cancellationToken = default) =>
        await DbSet.AnyAsync(predicate, cancellationToken);

    public virtual async Task<int> CountAsync(
        Expression<Func<T, bool>> predicate,
        CancellationToken cancellationToken = default) =>
        await DbSet.CountAsync(predicate, cancellationToken);

    public virtual async Task AddAsync(T entity, CancellationToken cancellationToken = default) =>
        await DbSet.AddAsync(entity, cancellationToken);

    public virtual void Update(T entity) => DbSet.Update(entity);

    public virtual void Remove(T entity) => DbSet.Remove(entity);

    public virtual IQueryable<T> Query() => DbSet.AsQueryable();
}
