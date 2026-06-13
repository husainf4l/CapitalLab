using CapitalLab.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace CapitalLab.Infrastructure.Services.Notifications;

/// <summary>
/// Stub SMS service. Wire to Twilio / AWS SNS / local provider in production.
/// </summary>
public sealed class SmsService(ILogger<SmsService> logger) : ISmsService
{
    public Task SendAsync(string phoneNumber, string message, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("[SMS STUB] To: {Phone} | Message: {Msg}", phoneNumber, message);
        return Task.CompletedTask;
    }

    public Task SendTemplatedAsync(string phoneNumber, string templateCode,
        Dictionary<string, string> variables, string language = "en",
        CancellationToken cancellationToken = default)
    {
        logger.LogInformation("[SMS STUB] Template: {Code} To: {Phone}", templateCode, phoneNumber);
        return Task.CompletedTask;
    }
}
