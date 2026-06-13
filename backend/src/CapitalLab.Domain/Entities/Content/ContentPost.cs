using CapitalLab.Domain.Common;
using CapitalLab.Domain.Enums;

namespace CapitalLab.Domain.Entities.Content;

public class ContentPost : AggregateRoot
{
    public ContentPostType Type { get; private set; }
    public Guid? CategoryId { get; private set; }
    public Guid? AuthorId { get; private set; }
    public string TitleEn { get; private set; } = string.Empty;
    public string TitleAr { get; private set; } = string.Empty;
    public string? SummaryEn { get; private set; }
    public string? SummaryAr { get; private set; }
    public string ContentEn { get; private set; } = string.Empty;
    public string ContentAr { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string? FeaturedImageUrl { get; private set; }
    public string? ThumbnailUrl { get; private set; }
    public string? MetaTitle { get; private set; }
    public string? MetaDescription { get; private set; }
    public string? Keywords { get; private set; }
    public DateTime? PublishedAt { get; private set; }
    public DateTime? PublishAt { get; private set; }
    public DateTime? ExpiryDate { get; private set; }
    public bool IsFeatured { get; private set; }
    public bool IsPublished { get; private set; }
    public int ViewCount { get; private set; }

    // Navigation
    public ContentCategory? Category { get; private set; }
    public ContentAuthor? Author { get; private set; }
    public ICollection<ContentPostTag> PostTags { get; private set; } = [];

    private ContentPost() { }

    public static ContentPost Create(
        ContentPostType type,
        Guid? categoryId,
        Guid? authorId,
        string titleEn, string titleAr,
        string? summaryEn, string? summaryAr,
        string contentEn, string contentAr,
        string slug,
        string? featuredImageUrl, string? thumbnailUrl,
        string? metaTitle, string? metaDescription, string? keywords,
        DateTime? expiryDate, DateTime? publishAt = null)
    {
        return new ContentPost
        {
            Id = Guid.NewGuid(),
            Type = type,
            CategoryId = categoryId,
            AuthorId = authorId,
            TitleEn = titleEn.Trim(),
            TitleAr = titleAr.Trim(),
            SummaryEn = summaryEn?.Trim(),
            SummaryAr = summaryAr?.Trim(),
            ContentEn = contentEn.Trim(),
            ContentAr = contentAr.Trim(),
            Slug = slug.Trim().ToLowerInvariant(),
            FeaturedImageUrl = featuredImageUrl?.Trim(),
            ThumbnailUrl = thumbnailUrl?.Trim(),
            MetaTitle = metaTitle?.Trim(),
            MetaDescription = metaDescription?.Trim(),
            Keywords = keywords?.Trim(),
            ExpiryDate = expiryDate,
            PublishAt = publishAt,
            IsFeatured = false,
            IsPublished = false,
            ViewCount = 0
        };
    }

    public void Update(
        ContentPostType type,
        Guid? categoryId,
        Guid? authorId,
        string titleEn, string titleAr,
        string? summaryEn, string? summaryAr,
        string contentEn, string contentAr,
        string slug,
        string? featuredImageUrl, string? thumbnailUrl,
        string? metaTitle, string? metaDescription, string? keywords,
        DateTime? expiryDate, DateTime? publishAt = null)
    {
        Type = type;
        CategoryId = categoryId;
        AuthorId = authorId;
        TitleEn = titleEn.Trim();
        TitleAr = titleAr.Trim();
        SummaryEn = summaryEn?.Trim();
        SummaryAr = summaryAr?.Trim();
        ContentEn = contentEn.Trim();
        ContentAr = contentAr.Trim();
        Slug = slug.Trim().ToLowerInvariant();
        FeaturedImageUrl = featuredImageUrl?.Trim();
        ThumbnailUrl = thumbnailUrl?.Trim();
        MetaTitle = metaTitle?.Trim();
        MetaDescription = metaDescription?.Trim();
        Keywords = keywords?.Trim();
        ExpiryDate = expiryDate;
        PublishAt = publishAt;
    }

    public void AutoPublish()
    {
        IsPublished = true;
        if (!PublishedAt.HasValue)
            PublishedAt = DateTime.UtcNow;
        PublishAt = null;
    }

    public void AutoExpire() => IsPublished = false;

    public void Publish()
    {
        IsPublished = true;
        if (!PublishedAt.HasValue)
            PublishedAt = DateTime.UtcNow;
    }

    public void Unpublish() => IsPublished = false;

    public void Feature() => IsFeatured = true;
    public void Unfeature() => IsFeatured = false;

    public void IncrementView() => ViewCount++;
}
