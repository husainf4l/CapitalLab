using CapitalLab.Domain.Entities.Notifications;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Notifications;

public class NotificationTemplateConfiguration : AuditableEntityConfiguration<NotificationTemplate>
{
    public override void Configure(EntityTypeBuilder<NotificationTemplate> builder)
    {
        base.Configure(builder);
        builder.ToTable("notification_templates", "notifications");

        builder.Property(t => t.Code).IsRequired().HasMaxLength(100);
        builder.Property(t => t.Name).IsRequired().HasMaxLength(200);
        builder.Property(t => t.Subject).IsRequired().HasMaxLength(500);
        builder.Property(t => t.Body).IsRequired();
        builder.Property(t => t.BodyAr);
        builder.Property(t => t.Channel).HasConversion<string>().HasMaxLength(20);

        builder.HasIndex(t => t.Code).IsUnique();
    }
}
