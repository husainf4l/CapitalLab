using CapitalLab.Domain.Common;

namespace CapitalLab.Domain.Entities.Content;

public class ContentNewsletterSubscriber : AuditableEntity
{
    public string Email { get; private set; } = string.Empty;
    public string Language { get; private set; } = "en";
    public bool IsConfirmed { get; private set; }
    public DateTime? ConfirmedAt { get; private set; }
    public bool IsUnsubscribed { get; private set; }
    public DateTime? UnsubscribedAt { get; private set; }
    public string UnsubscribeToken { get; private set; } = string.Empty;

    private ContentNewsletterSubscriber() { }

    public static ContentNewsletterSubscriber Create(string email, string language)
    {
        return new ContentNewsletterSubscriber
        {
            Id = Guid.NewGuid(),
            Email = email.Trim().ToLowerInvariant(),
            Language = language is "ar" ? "ar" : "en",
            IsConfirmed = true,
            ConfirmedAt = DateTime.UtcNow,
            IsUnsubscribed = false,
            UnsubscribeToken = Guid.NewGuid().ToString("N")
        };
    }

    public void Unsubscribe()
    {
        IsUnsubscribed = true;
        UnsubscribedAt = DateTime.UtcNow;
    }

    public void Resubscribe()
    {
        IsUnsubscribed = false;
        UnsubscribedAt = null;
    }
}
