using CapitalLab.Domain.Entities.Notifications;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Notifications;

public class NotificationConfiguration : AuditableEntityConfiguration<Notification>
{
    public override void Configure(EntityTypeBuilder<Notification> builder)
    {
        base.Configure(builder);
        builder.ToTable("notifications", "notifications");

        builder.Property(n => n.Type).IsRequired().HasMaxLength(100);
        builder.Property(n => n.Title).IsRequired().HasMaxLength(500);
        builder.Property(n => n.Message).IsRequired().HasMaxLength(2000);
        builder.Property(n => n.PayloadJson).HasMaxLength(4000);
        builder.Property(n => n.Channel).HasConversion<string>().HasMaxLength(20);
        builder.Property(n => n.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(n => n.SentAt).HasColumnType("timestamptz");
        builder.Property(n => n.ReadAt).HasColumnType("timestamptz");
        builder.Property(n => n.ScheduledAt).HasColumnType("timestamptz");

        builder.HasIndex(n => n.UserId);
        builder.HasIndex(n => new { n.UserId, n.Status });

        builder.HasMany(n => n.Logs)
            .WithOne(l => l.Notification)
            .HasForeignKey(l => l.NotificationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
