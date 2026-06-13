using CapitalLab.Contracts.Enums;

namespace CapitalLab.Contracts.Notifications;

public record SendTestNotificationRequest(
    Guid UserId,
    NotificationChannel Channel,
    string Title,
    string Message);

public record CreateNotificationTemplateRequest(
    string Code,
    string Name,
    string Subject,
    string Body,
    string? BodyAr,
    NotificationChannel Channel);

public record UpdateNotificationTemplateRequest(
    string Name,
    string Subject,
    string Body,
    string? BodyAr);
