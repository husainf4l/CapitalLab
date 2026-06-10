using CapitalLab.Domain.Entities.Operations;
using CapitalLab.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Operations;

public class AppointmentConfiguration : AuditableEntityConfiguration<Appointment>
{
    public override void Configure(EntityTypeBuilder<Appointment> builder)
    {
        base.Configure(builder);

        builder.ToTable("appointments", "operations");

        builder.Property(a => a.AppointmentNumber).IsRequired().HasMaxLength(30);
        builder.Property(a => a.AppointmentType).HasConversion<string>().IsRequired().HasMaxLength(30);
        builder.Property(a => a.Status).HasConversion<string>().IsRequired().HasMaxLength(30);
        builder.Property(a => a.Notes).HasMaxLength(1000);
        builder.Property(a => a.CancellationReason).HasMaxLength(1000);

        builder.HasIndex(a => a.AppointmentNumber).IsUnique().HasDatabaseName("ix_appointments_number");
        builder.HasIndex(a => a.PatientId).HasDatabaseName("ix_appointments_patient_id");
        builder.HasIndex(a => a.BranchId).HasDatabaseName("ix_appointments_branch_id");
        builder.HasIndex(a => a.AppointmentDate).HasDatabaseName("ix_appointments_date");
        builder.HasIndex(a => a.Status).HasDatabaseName("ix_appointments_status");

        builder.HasOne(a => a.Patient).WithMany().HasForeignKey(a => a.PatientId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(a => a.Branch).WithMany().HasForeignKey(a => a.BranchId).OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(a => a.Items).WithOne(i => i.Appointment).HasForeignKey(i => i.AppointmentId).OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(a => a.StatusHistory).WithOne(h => h.Appointment).HasForeignKey(h => h.AppointmentId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(a => a.HomeCollectionRequest).WithOne(h => h.Appointment).HasForeignKey<HomeCollectionRequest>(h => h.AppointmentId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(a => a.TestOrder).WithOne(o => o.Appointment).HasForeignKey<TestOrder>(o => o.AppointmentId).OnDelete(DeleteBehavior.SetNull);
    }
}
