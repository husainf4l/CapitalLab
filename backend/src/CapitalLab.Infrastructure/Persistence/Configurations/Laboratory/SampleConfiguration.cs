using CapitalLab.Domain.Entities.Laboratory;
using CapitalLab.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Laboratory;

public class SampleConfiguration : AuditableEntityConfiguration<Sample>
{
    public override void Configure(EntityTypeBuilder<Sample> builder)
    {
        base.Configure(builder);

        builder.ToTable("samples", "laboratory");

        builder.Property(s => s.SampleNumber).IsRequired().HasMaxLength(30);
        builder.Property(s => s.SampleType).HasConversion<string>().IsRequired().HasMaxLength(20);
        builder.Property(s => s.Status).HasConversion<string>().IsRequired().HasMaxLength(20);
        builder.Property(s => s.Barcode).HasMaxLength(100);
        builder.Property(s => s.BarcodeImagePath).HasMaxLength(500);
        builder.Property(s => s.QRCode).HasMaxLength(200);
        builder.Property(s => s.QRCodeImagePath).HasMaxLength(500);
        builder.Property(s => s.Notes).HasMaxLength(1000);
        builder.Property(s => s.RejectionReason).HasMaxLength(1000);
        builder.Property(s => s.CollectionDateTime).HasColumnType("timestamptz");
        builder.Property(s => s.ReceivedDateTime).HasColumnType("timestamptz");
        builder.Property(s => s.ProcessingStartedAt).HasColumnType("timestamptz");
        builder.Property(s => s.ProcessingCompletedAt).HasColumnType("timestamptz");

        builder.HasIndex(s => s.SampleNumber).IsUnique().HasDatabaseName("ix_samples_sample_number");
        builder.HasIndex(s => s.Barcode).IsUnique().HasDatabaseName("ix_samples_barcode");
        builder.HasIndex(s => s.TestOrderId).HasDatabaseName("ix_samples_test_order_id");
        builder.HasIndex(s => s.PatientId).HasDatabaseName("ix_samples_patient_id");
        builder.HasIndex(s => s.BranchId).HasDatabaseName("ix_samples_branch_id");
        builder.HasIndex(s => s.Status).HasDatabaseName("ix_samples_status");

        builder.HasMany(s => s.Items)
            .WithOne(i => i.Sample)
            .HasForeignKey(i => i.SampleId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
