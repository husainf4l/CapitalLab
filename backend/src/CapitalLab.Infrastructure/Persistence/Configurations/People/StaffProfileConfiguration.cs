using CapitalLab.Domain.Entities.People;
using CapitalLab.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.People;

public class StaffProfileConfiguration : AuditableEntityConfiguration<StaffProfile>
{
    public override void Configure(EntityTypeBuilder<StaffProfile> builder)
    {
        base.Configure(builder);

        builder.ToTable("staff_profiles", "people");

        builder.Property(s => s.EmployeeCode)
            .IsRequired()
            .HasMaxLength(30);

        builder.Property(s => s.FullName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(s => s.JobTitle)
            .HasMaxLength(100);

        builder.Property(s => s.Department)
            .HasMaxLength(100);

        builder.Property(s => s.Phone)
            .HasMaxLength(30);

        builder.Property(s => s.Email)
            .HasMaxLength(150);

        builder.HasIndex(s => s.EmployeeCode)
            .IsUnique()
            .HasDatabaseName("ix_staff_profiles_employee_code");

        builder.HasIndex(s => s.BranchId)
            .HasDatabaseName("ix_staff_profiles_branch_id");

        builder.HasIndex(s => s.IsActive)
            .HasDatabaseName("ix_staff_profiles_is_active");
    }
}
