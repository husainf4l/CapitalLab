using CapitalLab.Domain.Common;
using CapitalLab.Domain.Enums;

namespace CapitalLab.Domain.Entities.Mobile;

public class DeviceToken : AuditableEntity
{
    public Guid UserId { get; private set; }
    public string DeviceId { get; private set; } = string.Empty;
    public DevicePlatform Platform { get; private set; }
    public string PushToken { get; private set; } = string.Empty;
    public bool IsActive { get; private set; } = true;
    public DateTime? LastActiveAt { get; private set; }

    private DeviceToken() { }

    public static DeviceToken Register(Guid userId, string deviceId, DevicePlatform platform, string pushToken)
    {
        return new DeviceToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            DeviceId = deviceId,
            Platform = platform,
            PushToken = pushToken,
            LastActiveAt = DateTime.UtcNow
        };
    }

    public void UpdateToken(string pushToken)
    {
        PushToken = pushToken;
        LastActiveAt = DateTime.UtcNow;
        IsActive = true;
    }

    public void Deactivate() => IsActive = false;
    public void Touch() => LastActiveAt = DateTime.UtcNow;
}
