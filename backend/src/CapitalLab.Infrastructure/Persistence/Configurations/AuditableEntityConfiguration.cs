using CapitalLab.Domain.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations;

/// <summary>
/// Base EF Core configuration applied to every AuditableEntity.
/// Configures the RowVersion concurrency token and common audit column names.
/// Subclass this for each aggregate root's configuration.
/// </summary>
public abstract class AuditableEntityConfiguration<T> : IEntityTypeConfiguration<T>
    where T : AuditableEntity
{
    public virtual void Configure(EntityTypeBuilder<T> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id)
            .ValueGeneratedNever();

        builder.Property(e => e.RowVersion)
            .IsRowVersion()
            .IsConcurrencyToken();

        builder.Property(e => e.CreatedAt)
            .IsRequired()
            .HasColumnType("timestamptz");

        builder.Property(e => e.UpdatedAt)
            .IsRequired()
            .HasColumnType("timestamptz");

        builder.Property(e => e.DeletedAt)
            .HasColumnType("timestamptz");

        // Global soft-delete query filter — entities must opt-in per configuration
        builder.HasQueryFilter(e => e.DeletedAt == null);
    }
}
