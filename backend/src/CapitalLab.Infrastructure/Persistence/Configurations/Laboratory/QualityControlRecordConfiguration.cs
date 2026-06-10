using CapitalLab.Domain.Entities.Laboratory;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Laboratory;

public class QualityControlRecordConfiguration : IEntityTypeConfiguration<QualityControlRecord>
{
    public void Configure(EntityTypeBuilder<QualityControlRecord> builder)
    {
        builder.ToTable("quality_control_records", "laboratory");

        builder.HasKey(q => q.Id);
        builder.Property(q => q.Id).ValueGeneratedNever();
        builder.Property(q => q.Result).HasConversion<string>().IsRequired().HasMaxLength(20);
        builder.Property(q => q.Notes).HasMaxLength(1000);
        builder.Property(q => q.CheckedAt).HasColumnType("timestamptz");

        builder.HasIndex(q => q.SampleId).HasDatabaseName("ix_quality_control_records_sample_id");

        builder.HasOne(q => q.Sample)
            .WithMany()
            .HasForeignKey(q => q.SampleId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
