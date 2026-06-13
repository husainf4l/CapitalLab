using CapitalLab.Domain.Entities.Settings;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Settings;

public class SystemSettingConfiguration : AuditableEntityConfiguration<SystemSetting>
{
    public override void Configure(EntityTypeBuilder<SystemSetting> builder)
    {
        base.Configure(builder);
        builder.ToTable("system_settings", "settings");

        builder.Property(s => s.Key).IsRequired().HasMaxLength(200);
        builder.Property(s => s.Value).IsRequired();
        builder.Property(s => s.Category).IsRequired().HasMaxLength(100);
        builder.Property(s => s.Description).HasMaxLength(500);

        builder.HasIndex(s => s.Key).IsUnique();
        builder.HasIndex(s => s.Category);
    }
}
