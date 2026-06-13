using CapitalLab.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace CapitalLab.Infrastructure.Services.Notifications;

/// <summary>
/// Stub WhatsApp service. Wire to WhatsApp Business API in production.
/// </summary>
public sealed class WhatsAppService(ILogger<WhatsAppService> logger) : IWhatsAppService
{
    public Task SendAsync(string phoneNumber, string message, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("[WHATSAPP STUB] To: {Phone} | Message: {Msg}", phoneNumber, message);
        return Task.CompletedTask;
    }

    public Task SendTemplatedAsync(string phoneNumber, string templateCode,
        Dictionary<string, string> variables, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("[WHATSAPP STUB] Template: {Code} To: {Phone}", templateCode, phoneNumber);
        return Task.CompletedTask;
    }
}
