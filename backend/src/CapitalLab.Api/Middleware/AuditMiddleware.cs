using CapitalLab.Application.Common.Interfaces;

namespace CapitalLab.Api.Middleware;

/// <summary>
/// Records an audit entry for every state-mutating HTTP request (POST, PUT, PATCH, DELETE).
/// The detailed before/after values are captured by the EF Core interceptors on the entity level.
/// This middleware provides the HTTP-level audit trail (who accessed what endpoint and when).
/// </summary>
public sealed class AuditMiddleware(RequestDelegate next)
{
    private static readonly HashSet<string> MutatingMethods =
        ["POST", "PUT", "PATCH", "DELETE"];

    public async Task InvokeAsync(HttpContext context, IAuditService auditService)
    {
        await next(context);

        if (!MutatingMethods.Contains(context.Request.Method.ToUpperInvariant()))
            return;

        if (context.Response.StatusCode is >= 200 and < 300)
        {
            var currentUser = context.RequestServices.GetService<ICurrentUserService>();

            await auditService.LogAsync(new AuditEntry(
                EntityType: $"HTTP:{context.Request.Method}",
                EntityId: Guid.Empty,
                Action: AuditAction.Create,
                AdditionalData: new
                {
                    Path = context.Request.Path.Value,
                    Method = context.Request.Method,
                    StatusCode = context.Response.StatusCode,
                    UserId = currentUser?.UserId,
                    Ip = context.Connection.RemoteIpAddress?.ToString()
                }
            ));
        }
    }
}
