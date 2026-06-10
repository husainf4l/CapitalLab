using CapitalLab.Domain.Entities.Operations;
using CapitalLab.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Operations;

public class HomeCollectionRequestConfiguration : AuditableEntityConfiguration<HomeCollectionRequest>
{
    public override void Configure(EntityTypeBuilder<HomeCollectionRequest> builder)
    {
        base.Configure(builder);

        builder.ToTable("home_collection_requests", "operations");
        builder.Property(h => h.Address).IsRequired().HasMaxLength(500);
        builder.Property(h => h.City).HasMaxLength(100);
        builder.Property(h => h.Area).HasMaxLength(100);
        builder.Property(h => h.Latitude).HasPrecision(10, 7);
        builder.Property(h => h.Longitude).HasPrecision(10, 7);
        builder.Property(h => h.Status).HasConversion<string>().IsRequired().HasMaxLength(30);
        builder.Property(h => h.CollectionNotes).HasMaxLength(1000);

        builder.HasIndex(h => h.Status).HasDatabaseName("ix_home_collection_requests_status");
        builder.HasIndex(h => h.AssignedStaffId).HasDatabaseName("ix_home_collection_requests_assigned_staff_id");
        builder.HasIndex(h => h.PatientId).HasDatabaseName("ix_home_collection_requests_patient_id");

        builder.HasOne(h => h.Patient).WithMany().HasForeignKey(h => h.PatientId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(h => h.AssignedStaff).WithMany().HasForeignKey(h => h.AssignedStaffId).OnDelete(DeleteBehavior.SetNull);
    }
}
