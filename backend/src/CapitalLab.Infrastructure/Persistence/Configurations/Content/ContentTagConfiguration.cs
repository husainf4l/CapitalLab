using CapitalLab.Domain.Entities.Content;
using CapitalLab.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Content;

public class ContentTagConfiguration : AuditableEntityConfiguration<ContentTag>
{
    public override void Configure(EntityTypeBuilder<ContentTag> builder)
    {
        base.Configure(builder);

        builder.ToTable("tags", "content");

        builder.Property(e => e.Name).IsRequired().HasMaxLength(100);
        builder.Property(e => e.Slug).IsRequired().HasMaxLength(100);

        builder.HasIndex(e => e.Slug).IsUnique().HasDatabaseName("ix_content_tags_slug");
    }
}
