using CapitalLab.Domain.Entities.Notifications;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Notifications;

public class NotificationLogConfiguration : IEntityTypeConfiguration<NotificationLog>
{
    public void Configure(EntityTypeBuilder<NotificationLog> builder)
    {
        builder.ToTable("notification_logs", "notifications");
        builder.HasKey(l => l.Id);
        builder.Property(l => l.Id).ValueGeneratedNever();
        builder.Property(l => l.Provider).IsRequired().HasMaxLength(50);
        builder.Property(l => l.Status).IsRequired().HasMaxLength(20);
        builder.Property(l => l.Response).HasMaxLength(2000);
        builder.Property(l => l.SentAt).HasColumnType("timestamptz").IsRequired();
        builder.HasIndex(l => l.NotificationId);
    }
}
