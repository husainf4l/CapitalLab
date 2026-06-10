using System.Security.Claims;
using CapitalLab.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;

namespace CapitalLab.Infrastructure.Services;

/// <summary>
/// Resolves the current user's context from the HTTP request's JWT claims.
/// Registered as Scoped — one instance per HTTP request.
/// </summary>
public sealed class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    private readonly ClaimsPrincipal? _user = httpContextAccessor.HttpContext?.User;

    public Guid? UserId =>
        Guid.TryParse(_user?.FindFirstValue(ClaimTypes.NameIdentifier)
                       ?? _user?.FindFirstValue("sub"), out var id)
            ? id : null;

    public string? Email => _user?.FindFirstValue(ClaimTypes.Email)
                             ?? _user?.FindFirstValue("email");

    public string? FullName => _user?.FindFirstValue(ClaimTypes.Name)
                                ?? _user?.FindFirstValue("name");

    public IReadOnlyList<string> Roles =>
        _user?.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList() ?? [];

    public IReadOnlyList<string> Permissions =>
        _user?.FindAll("permissions").Select(c => c.Value).ToList() ?? [];

    public Guid? BranchId =>
        Guid.TryParse(_user?.FindFirstValue("branchId"), out var id) ? id : null;

    public Guid? LabId =>
        Guid.TryParse(_user?.FindFirstValue("labId"), out var id) ? id : null;

    public bool IsAuthenticated => _user?.Identity?.IsAuthenticated == true;

    public string? IpAddress =>
        httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();

    public bool HasPermission(string permission) =>
        Permissions.Contains(permission, StringComparer.OrdinalIgnoreCase);

    public bool IsInRole(string role) =>
        Roles.Contains(role, StringComparer.OrdinalIgnoreCase);

    public bool IsInAnyRole(params string[] roles) =>
        roles.Any(IsInRole);
}
