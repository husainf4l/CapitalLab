using CapitalLab.Infrastructure.Persistence.Interceptors;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace CapitalLab.Infrastructure.Persistence;

/// <summary>
/// Design-time factory used by the EF Core CLI (migrations / scaffolding). It builds the context
/// directly instead of booting the full web host, so migrations can be generated without valid
/// JWT keys, a database connection, or the runtime DI graph. Not used at runtime.
/// </summary>
public sealed class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? "Host=localhost;Database=capitallab;Username=postgres;Password=postgres";

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql(connectionString, npgsql =>
                npgsql.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName))
            .UseSnakeCaseNamingConvention()
            .Options;

        // The mediator and current-user service are only exercised during SaveChanges, never during
        // migration scaffolding, so design-time stubs are safe here.
        return new ApplicationDbContext(
            options,
            mediator: null!,
            auditInterceptor: new AuditableEntityInterceptor(null!),
            softDeleteInterceptor: new SoftDeleteInterceptor());
    }
}
