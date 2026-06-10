using CapitalLab.Domain.Entities.Laboratory;
using CapitalLab.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Laboratory;

public class CriticalResultRuleConfiguration : AuditableEntityConfiguration<CriticalResultRule>
{
    public override void Configure(EntityTypeBuilder<CriticalResultRule> builder)
    {
        base.Configure(builder);

        builder.ToTable("critical_result_rules", "laboratory");

        builder.Property(r => r.MinCriticalValue).HasPrecision(18, 4);
        builder.Property(r => r.MaxCriticalValue).HasPrecision(18, 4);

        builder.HasIndex(r => r.LabTestId).IsUnique().HasDatabaseName("ix_critical_result_rules_lab_test_id");
    }
}
