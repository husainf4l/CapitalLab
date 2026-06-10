using Microsoft.AspNetCore.Identity;

namespace CapitalLab.Infrastructure.Identity;

/// <summary>
/// Extends ASP.NET Core Identity role with metadata.
/// System roles (SuperAdmin, Owner, etc.) cannot be deleted.
/// </summary>
public sealed class AppRole : IdentityRole<Guid>
{
    public string? Description { get; set; }
    public bool IsSystem { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
