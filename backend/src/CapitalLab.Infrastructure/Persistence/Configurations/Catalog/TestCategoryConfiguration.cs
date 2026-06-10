using CapitalLab.Domain.Entities.Catalog;
using CapitalLab.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Catalog;

public class TestCategoryConfiguration : AuditableEntityConfiguration<TestCategory>
{
    public override void Configure(EntityTypeBuilder<TestCategory> builder)
    {
        base.Configure(builder);

        builder.ToTable("test_categories", "catalog");

        builder.Property(c => c.Code)
            .IsRequired()
            .HasMaxLength(30);

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(c => c.NameAr)
            .HasMaxLength(150);

        builder.Property(c => c.Description)
            .HasMaxLength(500);

        builder.HasIndex(c => c.Code)
            .IsUnique()
            .HasDatabaseName("ix_test_categories_code");

        builder.HasIndex(c => c.SortOrder)
            .HasDatabaseName("ix_test_categories_sort_order");

        builder.HasMany(c => c.LabTests)
            .WithOne(t => t.Category)
            .HasForeignKey(t => t.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
