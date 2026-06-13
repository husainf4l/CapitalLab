using CapitalLab.Domain.Entities.Content;
using CapitalLab.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Content;

public class ContentFaqItemConfiguration : AuditableEntityConfiguration<ContentFaqItem>
{
    public override void Configure(EntityTypeBuilder<ContentFaqItem> builder)
    {
        base.Configure(builder);

        builder.ToTable("faq_items", "content");

        builder.Property(e => e.QuestionEn).IsRequired().HasMaxLength(500);
        builder.Property(e => e.QuestionAr).IsRequired().HasMaxLength(500);
        builder.Property(e => e.AnswerEn).IsRequired();
        builder.Property(e => e.AnswerAr).IsRequired();
        builder.Property(e => e.Category).HasMaxLength(100);

        builder.HasIndex(e => e.IsActive).HasDatabaseName("ix_content_faq_is_active");
        builder.HasIndex(e => new { e.IsActive, e.SortOrder }).HasDatabaseName("ix_content_faq_active_sort");
    }
}
