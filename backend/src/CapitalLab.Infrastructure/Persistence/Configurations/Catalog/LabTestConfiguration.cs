using CapitalLab.Domain.Entities.Catalog;
using CapitalLab.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Catalog;

public class LabTestConfiguration : AuditableEntityConfiguration<LabTest>
{
    public override void Configure(EntityTypeBuilder<LabTest> builder)
    {
        base.Configure(builder);

        builder.ToTable("lab_tests", "catalog");

        builder.Property(t => t.Code)
            .IsRequired()
            .HasMaxLength(30);

        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(t => t.NameAr)
            .HasMaxLength(200);

        builder.Property(t => t.Description)
            .HasMaxLength(1000);

        builder.Property(t => t.PreparationInstructions)
            .HasMaxLength(2000);

        builder.Property(t => t.Price)
            .HasPrecision(18, 3);

        builder.Property(t => t.Currency)
            .IsRequired()
            .HasMaxLength(5);

        builder.Property(t => t.ReferenceRange)
            .HasMaxLength(500);

        builder.Property(t => t.Unit)
            .HasMaxLength(50);

        builder.HasIndex(t => t.Code)
            .IsUnique()
            .HasDatabaseName("ix_lab_tests_code");

        builder.HasIndex(t => t.CategoryId)
            .HasDatabaseName("ix_lab_tests_category_id");

        builder.HasIndex(t => t.IsActive)
            .HasDatabaseName("ix_lab_tests_is_active");

        builder.HasMany(t => t.PackageTests)
            .WithOne(pt => pt.LabTest)
            .HasForeignKey(pt => pt.LabTestId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
