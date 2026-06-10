using CapitalLab.Domain.Entities.People;
using CapitalLab.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.People;

public class DoctorConfiguration : AuditableEntityConfiguration<Doctor>
{
    public override void Configure(EntityTypeBuilder<Doctor> builder)
    {
        base.Configure(builder);

        builder.ToTable("doctors", "people");

        builder.Property(d => d.FullName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(d => d.Specialization)
            .HasMaxLength(150);

        builder.Property(d => d.LicenseNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(d => d.Phone)
            .HasMaxLength(30);

        builder.Property(d => d.Email)
            .HasMaxLength(150);

        builder.Property(d => d.DigitalSignatureUrl)
            .HasMaxLength(500);

        builder.HasIndex(d => d.LicenseNumber)
            .IsUnique()
            .HasDatabaseName("ix_doctors_license_number");

        builder.HasIndex(d => d.BranchId)
            .HasDatabaseName("ix_doctors_branch_id");

        builder.HasIndex(d => d.IsActive)
            .HasDatabaseName("ix_doctors_is_active");
    }
}
