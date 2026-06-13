using CapitalLab.Domain.Enums;

namespace CapitalLab.Application.Common.Interfaces;

public record NotificationRequest(
    Guid UserId,
    string Type,
    NotificationChannel Channel,
    string Title,
    string Message,
    string? PayloadJson = null,
    DateTime? ScheduledAt = null);

public interface INotificationService
{
    Task SendAsync(NotificationRequest request, CancellationToken cancellationToken = default);
    Task SendMultiChannelAsync(Guid userId, string type, string title, string message, IEnumerable<NotificationChannel> channels, CancellationToken cancellationToken = default);
    Task SendToRoleAsync(string role, string type, string title, string message, NotificationChannel channel, CancellationToken cancellationToken = default);
}
