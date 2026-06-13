using CapitalLab.Domain.Entities.Content;
using CapitalLab.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Content;

public class ContentAuthorConfiguration : AuditableEntityConfiguration<ContentAuthor>
{
    public override void Configure(EntityTypeBuilder<ContentAuthor> builder)
    {
        base.Configure(builder);

        builder.ToTable("authors", "content");

        builder.Property(e => e.FullName).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Slug).IsRequired().HasMaxLength(200);
        builder.Property(e => e.JobTitle).HasMaxLength(200);
        builder.Property(e => e.Credentials).HasMaxLength(500);
        builder.Property(e => e.Bio).HasMaxLength(2000);
        builder.Property(e => e.ImageUrl).HasMaxLength(500);

        builder.HasIndex(e => e.Slug).IsUnique().HasDatabaseName("uq_content_authors_slug");
        builder.HasIndex(e => e.IsActive).HasDatabaseName("ix_content_authors_is_active");
    }
}
