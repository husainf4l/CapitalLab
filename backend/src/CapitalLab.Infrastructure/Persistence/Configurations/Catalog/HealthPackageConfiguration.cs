using CapitalLab.Domain.Entities.Catalog;
using CapitalLab.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Catalog;

public class HealthPackageConfiguration : AuditableEntityConfiguration<HealthPackage>
{
    public override void Configure(EntityTypeBuilder<HealthPackage> builder)
    {
        base.Configure(builder);

        builder.ToTable("health_packages", "catalog");

        builder.Property(p => p.Code)
            .IsRequired()
            .HasMaxLength(30);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.NameAr)
            .HasMaxLength(200);

        builder.Property(p => p.Description)
            .HasMaxLength(1000);

        builder.Property(p => p.Price)
            .HasPrecision(18, 3);

        builder.Property(p => p.Currency)
            .IsRequired()
            .HasMaxLength(5);

        builder.Property(p => p.DiscountPercentage)
            .HasPrecision(5, 2);

        builder.Ignore(p => p.EffectivePrice);

        builder.HasIndex(p => p.Code)
            .IsUnique()
            .HasDatabaseName("ix_health_packages_code");

        builder.HasIndex(p => p.IsActive)
            .HasDatabaseName("ix_health_packages_is_active");

        builder.HasMany(p => p.PackageTests)
            .WithOne(pt => pt.Package)
            .HasForeignKey(pt => pt.PackageId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
