using CapitalLab.Domain.Common;

namespace CapitalLab.Domain.Entities.Content;

public class ContentTag : AuditableEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;

    public ICollection<ContentPostTag> PostTags { get; private set; } = [];

    private ContentTag() { }

    public static ContentTag Create(string name, string slug)
    {
        return new ContentTag
        {
            Id = Guid.NewGuid(),
            Name = name.Trim(),
            Slug = slug.Trim().ToLowerInvariant()
        };
    }

    public void Update(string name, string slug)
    {
        Name = name.Trim();
        Slug = slug.Trim().ToLowerInvariant();
    }
}
