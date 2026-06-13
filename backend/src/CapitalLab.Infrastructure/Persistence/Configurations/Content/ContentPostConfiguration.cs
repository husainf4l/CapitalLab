using CapitalLab.Domain.Entities.Content;
using CapitalLab.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Content;

public class ContentPostConfiguration : AuditableEntityConfiguration<ContentPost>
{
    public override void Configure(EntityTypeBuilder<ContentPost> builder)
    {
        base.Configure(builder);

        builder.ToTable("posts", "content");

        builder.Property(e => e.Type).IsRequired().HasConversion<string>().HasMaxLength(50);
        builder.Property(e => e.TitleEn).IsRequired().HasMaxLength(500);
        builder.Property(e => e.TitleAr).IsRequired().HasMaxLength(500);
        builder.Property(e => e.SummaryEn).HasMaxLength(1000);
        builder.Property(e => e.SummaryAr).HasMaxLength(1000);
        builder.Property(e => e.ContentEn).IsRequired();
        builder.Property(e => e.ContentAr).IsRequired();
        builder.Property(e => e.Slug).IsRequired().HasMaxLength(500);
        builder.Property(e => e.FeaturedImageUrl).HasMaxLength(500);
        builder.Property(e => e.ThumbnailUrl).HasMaxLength(500);
        builder.Property(e => e.MetaTitle).HasMaxLength(200);
        builder.Property(e => e.MetaDescription).HasMaxLength(500);
        builder.Property(e => e.Keywords).HasMaxLength(500);
        builder.Property(e => e.PublishedAt).HasColumnType("timestamptz");
        builder.Property(e => e.PublishAt).HasColumnType("timestamptz");
        builder.Property(e => e.ExpiryDate).HasColumnType("timestamptz");

        builder.HasIndex(e => e.PublishAt).HasDatabaseName("ix_content_posts_publish_at");

        builder.HasIndex(e => e.Slug).IsUnique().HasDatabaseName("ix_content_posts_slug");
        builder.HasIndex(e => new { e.Type, e.IsPublished }).HasDatabaseName("ix_content_posts_type_published");
        builder.HasIndex(e => new { e.IsFeatured, e.IsPublished }).HasDatabaseName("ix_content_posts_featured_published");
        builder.HasIndex(e => e.PublishedAt).HasDatabaseName("ix_content_posts_published_at");

        builder.HasOne(e => e.Category)
            .WithMany(c => c.Posts)
            .HasForeignKey(e => e.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.Author)
            .WithMany(a => a.Posts)
            .HasForeignKey(e => e.AuthorId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(e => e.PostTags)
            .WithOne(pt => pt.Post)
            .HasForeignKey(pt => pt.PostId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
