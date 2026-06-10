using CapitalLab.Domain.Entities.Laboratory;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Laboratory;

public class ReportItemConfiguration : IEntityTypeConfiguration<ReportItem>
{
    public void Configure(EntityTypeBuilder<ReportItem> builder)
    {
        builder.ToTable("report_items", "laboratory");

        builder.HasKey(i => i.Id);
        builder.Property(i => i.Id).ValueGeneratedNever();
        builder.Property(i => i.TestName).IsRequired().HasMaxLength(200);
        builder.Property(i => i.ResultValue).HasMaxLength(500);
        builder.Property(i => i.Unit).HasMaxLength(50);
        builder.Property(i => i.ReferenceRange).HasMaxLength(200);
        builder.Property(i => i.Interpretation).HasMaxLength(50);

        builder.HasIndex(i => i.ReportId).HasDatabaseName("ix_report_items_report_id");
        builder.HasIndex(i => i.LabTestId).HasDatabaseName("ix_report_items_lab_test_id");
    }
}
