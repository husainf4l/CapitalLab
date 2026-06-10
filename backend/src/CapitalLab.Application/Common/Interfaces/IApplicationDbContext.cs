using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace CapitalLab.Application.Common.Interfaces;

/// <summary>
/// Application-visible database context contract.
/// Exposes DbSet properties for each aggregate root.
/// Infrastructure implements this with EF Core; Application only knows the interface.
///
/// DbSet properties are added here as new modules are implemented (Phase 1+).
/// </summary>
public interface IApplicationDbContext
{
    DatabaseFacade Database { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
