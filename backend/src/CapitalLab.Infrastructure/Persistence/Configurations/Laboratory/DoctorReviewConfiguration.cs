using CapitalLab.Domain.Entities.Laboratory;
using CapitalLab.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Laboratory;

public class DoctorReviewConfiguration : AuditableEntityConfiguration<DoctorReview>
{
    public override void Configure(EntityTypeBuilder<DoctorReview> builder)
    {
        base.Configure(builder);

        builder.ToTable("doctor_reviews", "laboratory");

        builder.Property(r => r.Status).HasConversion<string>().IsRequired().HasMaxLength(20);
        builder.Property(r => r.Notes).HasMaxLength(2000);
        builder.Property(r => r.ReviewedAt).HasColumnType("timestamptz");

        builder.HasIndex(r => r.SampleId).HasDatabaseName("ix_doctor_reviews_sample_id");
        builder.HasIndex(r => r.DoctorId).HasDatabaseName("ix_doctor_reviews_doctor_id");
        builder.HasIndex(r => r.Status).HasDatabaseName("ix_doctor_reviews_status");
    }
}
