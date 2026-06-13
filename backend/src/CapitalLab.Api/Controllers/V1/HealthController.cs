using System.Reflection;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Mvc;

namespace CapitalLab.Api.Controllers.V1;

/// <summary>
/// Health check and version endpoints. All are public.
/// </summary>
[AllowAnonymous]
[ApiController]
[Route("")]
[ApiExplorerSettings(IgnoreApi = true)]
public sealed class HealthController : ControllerBase
{
    private static readonly string _version =
        typeof(HealthController).Assembly
            .GetCustomAttribute<AssemblyInformationalVersionAttribute>()
            ?.InformationalVersion?.Split('+')[0]
        ?? "0.1.0";

    private static readonly string _buildDate =
        System.IO.File.Exists(System.IO.Path.Combine(AppContext.BaseDirectory, "build-date.txt"))
            ? System.IO.File.ReadAllText(System.IO.Path.Combine(AppContext.BaseDirectory, "build-date.txt")).Trim()
            : DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");

    [HttpGet("health")]
    public IActionResult Health() => Ok(new { status = "healthy", timestamp = DateTime.UtcNow });

    [HttpGet("health/live")]
    public IActionResult Live() => Ok(new { status = "alive" });

    [HttpGet("health/ready")]
    public IActionResult Ready() => Ok(new { status = "ready", timestamp = DateTime.UtcNow });

    [HttpGet("api/version")]
    public IActionResult Version() => Ok(new
    {
        version = _version,
        buildDate = _buildDate,
        environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production",
        timestamp = DateTime.UtcNow
    });
}
