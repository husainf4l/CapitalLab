using CapitalLab.Domain.Entities.Content;
using CapitalLab.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Content;

public class ContentNewsletterSubscriberConfiguration : AuditableEntityConfiguration<ContentNewsletterSubscriber>
{
    public override void Configure(EntityTypeBuilder<ContentNewsletterSubscriber> builder)
    {
        base.Configure(builder);

        builder.ToTable("newsletter_subscribers", "content");

        builder.Property(e => e.Email).IsRequired().HasMaxLength(320);
        builder.Property(e => e.Language).IsRequired().HasMaxLength(5).HasDefaultValue("en");
        builder.Property(e => e.UnsubscribeToken).IsRequired().HasMaxLength(64);

        builder.HasIndex(e => e.Email).IsUnique().HasDatabaseName("uq_content_newsletter_email");
        builder.HasIndex(e => e.UnsubscribeToken).HasDatabaseName("ix_content_newsletter_token");
        builder.HasIndex(e => e.IsUnsubscribed).HasDatabaseName("ix_content_newsletter_unsub");
    }
}
