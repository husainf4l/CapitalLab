using CapitalLab.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Catalog;

public class PackageTestConfiguration : IEntityTypeConfiguration<PackageTest>
{
    public void Configure(EntityTypeBuilder<PackageTest> builder)
    {
        builder.ToTable("package_tests", "catalog");

        builder.HasKey(pt => pt.Id);
        builder.Property(pt => pt.Id).ValueGeneratedNever();

        builder.HasIndex(pt => new { pt.PackageId, pt.LabTestId })
            .IsUnique()
            .HasDatabaseName("ix_package_tests_package_test");

        builder.HasOne(pt => pt.Package)
            .WithMany(p => p.PackageTests)
            .HasForeignKey(pt => pt.PackageId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(pt => pt.LabTest)
            .WithMany(t => t.PackageTests)
            .HasForeignKey(pt => pt.LabTestId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
