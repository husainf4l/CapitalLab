using CapitalLab.Domain.Entities.Laboratory;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Laboratory;

public class TestResultHistoryConfiguration : IEntityTypeConfiguration<TestResultHistory>
{
    public void Configure(EntityTypeBuilder<TestResultHistory> builder)
    {
        builder.ToTable("test_result_history", "laboratory");

        builder.HasKey(h => h.Id);
        builder.Property(h => h.Id).ValueGeneratedNever();
        builder.Property(h => h.OldValue).HasMaxLength(2000);
        builder.Property(h => h.NewValue).HasMaxLength(2000);
        builder.Property(h => h.ChangedAt).HasColumnType("timestamptz");

        builder.HasIndex(h => h.TestResultId).HasDatabaseName("ix_test_result_history_test_result_id");

        builder.HasOne(h => h.TestResult)
            .WithMany()
            .HasForeignKey(h => h.TestResultId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
