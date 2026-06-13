namespace CapitalLab.Api.Middleware;

/// <summary>
/// Injects OWASP-recommended security headers on every response.
/// </summary>
public sealed class SecurityHeadersMiddleware(RequestDelegate next, IHostEnvironment env)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var headers = context.Response.Headers;

        // Prevent clickjacking
        headers["X-Frame-Options"] = "DENY";

        // Prevent MIME-type sniffing
        headers["X-Content-Type-Options"] = "nosniff";

        // XSS filter (legacy browsers)
        headers["X-XSS-Protection"] = "1; mode=block";

        // Referrer policy
        headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

        // Permissions policy — restrict unnecessary browser features
        headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=()";

        // HSTS — only in production (not in dev/test where HTTPS may not be configured)
        if (!env.IsDevelopment())
            headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";

        // Content Security Policy — allow same-origin + trusted CDNs
        headers["Content-Security-Policy"] =
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline'; " +
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
            "font-src 'self' https://fonts.gstatic.com; " +
            "img-src 'self' data: blob:; " +
            "connect-src 'self' wss:; " +
            "frame-ancestors 'none'";

        await next(context);
    }
}
