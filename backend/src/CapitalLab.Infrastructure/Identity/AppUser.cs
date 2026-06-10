using Microsoft.AspNetCore.Identity;

namespace CapitalLab.Infrastructure.Identity;

/// <summary>
/// Extends ASP.NET Core Identity user with Capital Lab domain fields.
/// </summary>
public sealed class AppUser : IdentityUser<Guid>
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }
    public string LanguagePreference { get; set; } = "en";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }

    public string FullName => $"{FirstName} {LastName}".Trim();
    public bool IsDeleted => DeletedAt.HasValue;
}
