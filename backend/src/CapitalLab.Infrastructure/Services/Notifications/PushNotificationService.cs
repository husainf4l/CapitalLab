using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Domain.Entities.Mobile;
using CapitalLab.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CapitalLab.Infrastructure.Services.Notifications;

/// <summary>
/// Firebase FCM push notification service. Abstraction only — no production keys configured.
/// Wire FCM credentials in appsettings.Production.json when ready.
/// </summary>
public sealed class PushNotificationService(
    IRepository<DeviceToken> deviceRepo,
    ILogger<PushNotificationService> logger) : IPushNotificationService
{
    public Task SendToDeviceAsync(string pushToken, string title, string body,
        Dictionary<string, string>? data = null, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("[FCM STUB] Push to token {Token}: {Title}", pushToken[..Math.Min(8, pushToken.Length)], title);
        return Task.CompletedTask;
    }

    public async Task SendToUserAsync(Guid userId, string title, string body,
        Dictionary<string, string>? data = null, CancellationToken cancellationToken = default)
    {
        var tokens = await deviceRepo.Query()
            .Where(d => d.UserId == userId && d.IsActive)
            .Select(d => d.PushToken)
            .ToListAsync(cancellationToken);

        foreach (var token in tokens)
            await SendToDeviceAsync(token, title, body, data, cancellationToken);
    }

    public Task SendToTopicAsync(string topic, string title, string body, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("[FCM STUB] Push to topic {Topic}: {Title}", topic, title);
        return Task.CompletedTask;
    }
}
