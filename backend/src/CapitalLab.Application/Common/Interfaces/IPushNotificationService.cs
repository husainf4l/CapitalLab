namespace CapitalLab.Application.Common.Interfaces;

public interface IPushNotificationService
{
    Task SendToDeviceAsync(string pushToken, string title, string body, Dictionary<string, string>? data = null, CancellationToken cancellationToken = default);
    Task SendToUserAsync(Guid userId, string title, string body, Dictionary<string, string>? data = null, CancellationToken cancellationToken = default);
    Task SendToTopicAsync(string topic, string title, string body, CancellationToken cancellationToken = default);
}
