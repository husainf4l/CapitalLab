using CapitalLab.Domain.Entities.Organization;
using CapitalLab.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Organization;

public class BranchConfiguration : AuditableEntityConfiguration<Branch>
{
    public override void Configure(EntityTypeBuilder<Branch> builder)
    {
        base.Configure(builder);

        builder.ToTable("branches", "organization");

        builder.Property(b => b.Code)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(b => b.Name)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(b => b.NameAr)
            .HasMaxLength(150);

        builder.Property(b => b.Phone)
            .HasMaxLength(30);

        builder.Property(b => b.Email)
            .HasMaxLength(150);

        builder.Property(b => b.Address)
            .HasMaxLength(300);

        builder.Property(b => b.City)
            .HasMaxLength(100);

        builder.Property(b => b.Area)
            .HasMaxLength(100);

        builder.Property(b => b.Latitude)
            .HasPrecision(10, 7);

        builder.Property(b => b.Longitude)
            .HasPrecision(10, 7);

        builder.HasIndex(b => b.Code)
            .IsUnique()
            .HasDatabaseName("ix_branches_code");

        builder.HasIndex(b => b.IsActive)
            .HasDatabaseName("ix_branches_is_active");
    }
}
