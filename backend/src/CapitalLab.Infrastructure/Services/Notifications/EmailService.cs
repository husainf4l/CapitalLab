using CapitalLab.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace CapitalLab.Infrastructure.Services.Notifications;

/// <summary>
/// Stub email service. Wire to SMTP / SendGrid / SES in production.
/// </summary>
public sealed class EmailService(ILogger<EmailService> logger) : IEmailService
{
    public Task SendAsync(string to, string subject, string htmlBody,
        string? plainTextBody = null, IEnumerable<string>? cc = null,
        CancellationToken cancellationToken = default)
    {
        logger.LogInformation("[EMAIL STUB] To: {To} | Subject: {Subject}", to, subject);
        return Task.CompletedTask;
    }

    public Task SendTemplatedAsync(string to, string templateCode,
        Dictionary<string, string> variables, string language = "en",
        CancellationToken cancellationToken = default)
    {
        logger.LogInformation("[EMAIL STUB] Template: {Code} To: {To}", templateCode, to);
        return Task.CompletedTask;
    }
}
