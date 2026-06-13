using CapitalLab.Domain.Entities.Mobile;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Mobile;

public class DeviceTokenConfiguration : AuditableEntityConfiguration<DeviceToken>
{
    public override void Configure(EntityTypeBuilder<DeviceToken> builder)
    {
        base.Configure(builder);
        builder.ToTable("device_tokens", "identity");

        builder.Property(d => d.DeviceId).IsRequired().HasMaxLength(200);
        builder.Property(d => d.Platform).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(d => d.PushToken).IsRequired().HasMaxLength(500);
        builder.Property(d => d.LastActiveAt).HasColumnType("timestamptz");

        builder.HasIndex(d => new { d.UserId, d.DeviceId }).IsUnique();
        builder.HasIndex(d => d.UserId);
    }
}
