using CapitalLab.Domain.Entities.Laboratory;
using CapitalLab.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Laboratory;

public class TestResultConfiguration : AuditableEntityConfiguration<TestResult>
{
    public override void Configure(EntityTypeBuilder<TestResult> builder)
    {
        base.Configure(builder);

        builder.ToTable("test_results", "laboratory");

        builder.Property(r => r.ResultType).HasConversion<string>().IsRequired().HasMaxLength(20);
        builder.Property(r => r.Status).HasConversion<string>().IsRequired().HasMaxLength(20);
        builder.Property(r => r.Interpretation).HasConversion<string>().HasMaxLength(20);
        builder.Property(r => r.ResultValue).HasPrecision(18, 4);
        builder.Property(r => r.ResultText).HasMaxLength(2000);
        builder.Property(r => r.Unit).HasMaxLength(50);
        builder.Property(r => r.ReferenceRange).HasMaxLength(200);
        builder.Property(r => r.EnteredAt).HasColumnType("timestamptz");
        builder.Property(r => r.ApprovedAt).HasColumnType("timestamptz");

        builder.HasIndex(r => r.SampleId).HasDatabaseName("ix_test_results_sample_id");
        builder.HasIndex(r => r.PatientId).HasDatabaseName("ix_test_results_patient_id");
        builder.HasIndex(r => r.LabTestId).HasDatabaseName("ix_test_results_lab_test_id");
        builder.HasIndex(r => r.Status).HasDatabaseName("ix_test_results_status");
        builder.HasIndex(r => new { r.PatientId, r.LabTestId }).HasDatabaseName("ix_test_results_patient_lab_test");

        builder.HasOne(r => r.Sample)
            .WithMany()
            .HasForeignKey(r => r.SampleId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
