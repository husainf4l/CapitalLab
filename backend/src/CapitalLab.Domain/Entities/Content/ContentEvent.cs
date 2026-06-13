using CapitalLab.Domain.Common;

namespace CapitalLab.Domain.Entities.Content;

public class ContentEvent : AuditableEntity
{
    public string TitleEn { get; private set; } = string.Empty;
    public string TitleAr { get; private set; } = string.Empty;
    public string? DescriptionEn { get; private set; }
    public string? DescriptionAr { get; private set; }
    public string Slug { get; private set; } = string.Empty;
    public DateTime EventDate { get; private set; }
    public DateTime? EndDate { get; private set; }
    public string? Location { get; private set; }
    public string? CoverImageUrl { get; private set; }
    public string? RegistrationUrl { get; private set; }
    public bool IsPublished { get; private set; }
    public int ViewCount { get; private set; }
    public string? MetaTitle { get; private set; }
    public string? MetaDescription { get; private set; }

    private ContentEvent() { }

    public static ContentEvent Create(
        string titleEn, string titleAr,
        string? descriptionEn, string? descriptionAr,
        string slug,
        DateTime eventDate, DateTime? endDate,
        string? location, string? coverImageUrl, string? registrationUrl,
        string? metaTitle, string? metaDescription)
    {
        return new ContentEvent
        {
            Id = Guid.NewGuid(),
            TitleEn = titleEn.Trim(),
            TitleAr = titleAr.Trim(),
            DescriptionEn = descriptionEn?.Trim(),
            DescriptionAr = descriptionAr?.Trim(),
            Slug = slug.Trim().ToLowerInvariant(),
            EventDate = eventDate,
            EndDate = endDate,
            Location = location?.Trim(),
            CoverImageUrl = coverImageUrl?.Trim(),
            RegistrationUrl = registrationUrl?.Trim(),
            MetaTitle = metaTitle?.Trim(),
            MetaDescription = metaDescription?.Trim(),
            IsPublished = false,
            ViewCount = 0
        };
    }

    public void Update(
        string titleEn, string titleAr,
        string? descriptionEn, string? descriptionAr,
        string slug,
        DateTime eventDate, DateTime? endDate,
        string? location, string? coverImageUrl, string? registrationUrl,
        string? metaTitle, string? metaDescription)
    {
        TitleEn = titleEn.Trim();
        TitleAr = titleAr.Trim();
        DescriptionEn = descriptionEn?.Trim();
        DescriptionAr = descriptionAr?.Trim();
        Slug = slug.Trim().ToLowerInvariant();
        EventDate = eventDate;
        EndDate = endDate;
        Location = location?.Trim();
        CoverImageUrl = coverImageUrl?.Trim();
        RegistrationUrl = registrationUrl?.Trim();
        MetaTitle = metaTitle?.Trim();
        MetaDescription = metaDescription?.Trim();
    }

    public void Publish() => IsPublished = true;
    public void Unpublish() => IsPublished = false;
    public void IncrementView() => ViewCount++;
}
