using CapitalLab.Domain.Entities.Content;
using CapitalLab.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Content;

public class ContentEventConfiguration : AuditableEntityConfiguration<ContentEvent>
{
    public override void Configure(EntityTypeBuilder<ContentEvent> builder)
    {
        base.Configure(builder);

        builder.ToTable("events", "content");

        builder.Property(e => e.TitleEn).IsRequired().HasMaxLength(500);
        builder.Property(e => e.TitleAr).IsRequired().HasMaxLength(500);
        builder.Property(e => e.DescriptionEn).HasMaxLength(5000);
        builder.Property(e => e.DescriptionAr).HasMaxLength(5000);
        builder.Property(e => e.Slug).IsRequired().HasMaxLength(500);
        builder.Property(e => e.EventDate).IsRequired().HasColumnType("timestamptz");
        builder.Property(e => e.EndDate).HasColumnType("timestamptz");
        builder.Property(e => e.Location).HasMaxLength(300);
        builder.Property(e => e.CoverImageUrl).HasMaxLength(500);
        builder.Property(e => e.RegistrationUrl).HasMaxLength(500);
        builder.Property(e => e.MetaTitle).HasMaxLength(200);
        builder.Property(e => e.MetaDescription).HasMaxLength(500);

        builder.HasIndex(e => e.Slug).IsUnique().HasDatabaseName("ix_content_events_slug");
        builder.HasIndex(e => new { e.EventDate, e.IsPublished }).HasDatabaseName("ix_content_events_date_published");
    }
}
