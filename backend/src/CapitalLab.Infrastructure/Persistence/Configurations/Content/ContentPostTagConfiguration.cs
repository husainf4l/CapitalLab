using CapitalLab.Domain.Entities.Content;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Content;

public class ContentPostTagConfiguration : IEntityTypeConfiguration<ContentPostTag>
{
    public void Configure(EntityTypeBuilder<ContentPostTag> builder)
    {
        builder.ToTable("post_tags", "content");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id).ValueGeneratedNever();

        builder.HasIndex(e => new { e.PostId, e.TagId })
            .IsUnique()
            .HasDatabaseName("ix_content_post_tags_post_tag");

        builder.HasOne(e => e.Post)
            .WithMany(p => p.PostTags)
            .HasForeignKey(e => e.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Tag)
            .WithMany(t => t.PostTags)
            .HasForeignKey(e => e.TagId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
