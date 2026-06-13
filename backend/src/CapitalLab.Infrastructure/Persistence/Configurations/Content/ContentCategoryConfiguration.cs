using CapitalLab.Domain.Entities.Content;
using CapitalLab.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Content;

public class ContentCategoryConfiguration : AuditableEntityConfiguration<ContentCategory>
{
    public override void Configure(EntityTypeBuilder<ContentCategory> builder)
    {
        base.Configure(builder);

        builder.ToTable("categories", "content");

        builder.Property(e => e.NameEn).IsRequired().HasMaxLength(200);
        builder.Property(e => e.NameAr).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Slug).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Description).HasMaxLength(500);

        builder.HasIndex(e => e.Slug).IsUnique().HasDatabaseName("ix_content_categories_slug");
        builder.HasIndex(e => e.IsActive).HasDatabaseName("ix_content_categories_is_active");
    }
}
