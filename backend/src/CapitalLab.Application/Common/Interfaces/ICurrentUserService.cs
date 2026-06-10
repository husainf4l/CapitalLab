namespace CapitalLab.Application.Common.Interfaces;

/// <summary>
/// Exposes the authenticated user's context, resolved from the current HTTP request JWT.
/// </summary>
public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Email { get; }
    string? FullName { get; }
    IReadOnlyList<string> Roles { get; }
    IReadOnlyList<string> Permissions { get; }
    Guid? BranchId { get; }
    Guid? LabId { get; }
    bool IsAuthenticated { get; }
    string? IpAddress { get; }

    bool HasPermission(string permission);
    bool IsInRole(string role);
    bool IsInAnyRole(params string[] roles);
}
