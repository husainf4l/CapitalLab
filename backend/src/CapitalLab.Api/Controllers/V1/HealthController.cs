using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Mvc;

namespace CapitalLab.Api.Controllers.V1;

/// <summary>
/// Health check endpoints. All are public — used by load balancers and container orchestrators.
/// </summary>
[AllowAnonymous]
[ApiController]
[Route("")]
[ApiExplorerSettings(IgnoreApi = true)]
public sealed class HealthController : ControllerBase
{
    [HttpGet("health")]
    public IActionResult Health() => Ok(new { status = "healthy", timestamp = DateTime.UtcNow });

    [HttpGet("health/live")]
    public IActionResult Live() => Ok(new { status = "alive" });

    [HttpGet("health/ready")]
    public IActionResult Ready() => Ok(new { status = "ready", timestamp = DateTime.UtcNow });
}
