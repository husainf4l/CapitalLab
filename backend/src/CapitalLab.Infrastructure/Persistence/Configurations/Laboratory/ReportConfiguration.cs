using CapitalLab.Domain.Entities.Laboratory;
using CapitalLab.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Laboratory;

public class ReportConfiguration : AuditableEntityConfiguration<Report>
{
    public override void Configure(EntityTypeBuilder<Report> builder)
    {
        base.Configure(builder);

        builder.ToTable("reports", "laboratory");

        builder.Property(r => r.ReportNumber).IsRequired().HasMaxLength(30);
        builder.Property(r => r.Status).HasConversion<string>().IsRequired().HasMaxLength(20);
        builder.Property(r => r.PDFPath).HasMaxLength(500);
        builder.Property(r => r.QRCode).HasMaxLength(200);
        builder.Property(r => r.GeneratedAt).HasColumnType("timestamptz");
        builder.Property(r => r.ReleasedAt).HasColumnType("timestamptz");

        builder.HasIndex(r => r.ReportNumber).IsUnique().HasDatabaseName("ix_reports_report_number");
        builder.HasIndex(r => r.PatientId).HasDatabaseName("ix_reports_patient_id");
        builder.HasIndex(r => r.SampleId).HasDatabaseName("ix_reports_sample_id");
        builder.HasIndex(r => r.TestOrderId).HasDatabaseName("ix_reports_test_order_id");
        builder.HasIndex(r => r.Status).HasDatabaseName("ix_reports_status");

        builder.HasMany(r => r.Items)
            .WithOne(i => i.Report)
            .HasForeignKey(i => i.ReportId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
