using CapitalLab.Domain.Common;

namespace CapitalLab.Domain.Entities.Content;

public class ContentAuthor : AuditableEntity
{
    public string FullName { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string? JobTitle { get; private set; }
    public string? Credentials { get; private set; }
    public string? Bio { get; private set; }
    public string? ImageUrl { get; private set; }
    public bool IsActive { get; private set; } = true;

    public ICollection<ContentPost> Posts { get; private set; } = [];

    private ContentAuthor() { }

    public static ContentAuthor Create(string fullName, string slug, string? jobTitle, string? credentials, string? bio, string? imageUrl)
    {
        return new ContentAuthor
        {
            Id = Guid.NewGuid(),
            FullName = fullName.Trim(),
            Slug = slug.Trim().ToLowerInvariant(),
            JobTitle = jobTitle?.Trim(),
            Credentials = credentials?.Trim(),
            Bio = bio?.Trim(),
            ImageUrl = imageUrl?.Trim(),
            IsActive = true
        };
    }

    public void Update(string fullName, string slug, string? jobTitle, string? credentials, string? bio, string? imageUrl)
    {
        FullName = fullName.Trim();
        Slug = slug.Trim().ToLowerInvariant();
        JobTitle = jobTitle?.Trim();
        Credentials = credentials?.Trim();
        Bio = bio?.Trim();
        ImageUrl = imageUrl?.Trim();
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
