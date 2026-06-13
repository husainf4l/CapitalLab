using CapitalLab.Domain.Common;

namespace CapitalLab.Domain.Entities.Content;

public class ContentCategory : AuditableEntity
{
    public string NameEn { get; private set; } = string.Empty;
    public string NameAr { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; } = true;

    public ICollection<ContentPost> Posts { get; private set; } = [];

    private ContentCategory() { }

    public static ContentCategory Create(string nameEn, string nameAr, string slug, string? description, int sortOrder)
    {
        return new ContentCategory
        {
            Id = Guid.NewGuid(),
            NameEn = nameEn.Trim(),
            NameAr = nameAr.Trim(),
            Slug = slug.Trim().ToLowerInvariant(),
            Description = description?.Trim(),
            SortOrder = sortOrder,
            IsActive = true
        };
    }

    public void Update(string nameEn, string nameAr, string slug, string? description, int sortOrder)
    {
        NameEn = nameEn.Trim();
        NameAr = nameAr.Trim();
        Slug = slug.Trim().ToLowerInvariant();
        Description = description?.Trim();
        SortOrder = sortOrder;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
