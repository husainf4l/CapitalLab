using CapitalLab.Contracts.Enums;

namespace CapitalLab.Contracts.Notifications;

public record NotificationResponse(
    Guid Id,
    string Type,
    NotificationChannel Channel,
    string Title,
    string Message,
    NotificationStatus Status,
    DateTime CreatedAt,
    DateTime? SentAt,
    DateTime? ReadAt);

public record NotificationTemplateResponse(
    Guid Id,
    string Code,
    string Name,
    string Subject,
    string Body,
    string? BodyAr,
    NotificationChannel Channel,
    bool IsActive);

public record UnreadCountResponse(int Count);
