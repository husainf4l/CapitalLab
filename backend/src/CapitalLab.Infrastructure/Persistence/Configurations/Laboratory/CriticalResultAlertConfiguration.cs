using CapitalLab.Domain.Entities.Laboratory;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Laboratory;

public class CriticalResultAlertConfiguration : IEntityTypeConfiguration<CriticalResultAlert>
{
    public void Configure(EntityTypeBuilder<CriticalResultAlert> builder)
    {
        builder.ToTable("critical_result_alerts", "laboratory");

        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).ValueGeneratedNever();
        builder.Property(a => a.TriggerReason).IsRequired().HasMaxLength(500);
        builder.Property(a => a.TriggeredAt).HasColumnType("timestamptz");
        builder.Property(a => a.AcknowledgedAt).HasColumnType("timestamptz");

        builder.HasIndex(a => a.TestResultId).HasDatabaseName("ix_critical_result_alerts_test_result_id");
        builder.HasIndex(a => a.IsAcknowledged).HasDatabaseName("ix_critical_result_alerts_is_acknowledged");

        builder.HasOne(a => a.TestResult)
            .WithMany()
            .HasForeignKey(a => a.TestResultId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
