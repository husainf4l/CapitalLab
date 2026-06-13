namespace CapitalLab.Contracts.Mobile;

public record MeProfileResponse(
    Guid UserId,
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber,
    string? AvatarUrl,
    DateTime? LastLoginAt);

public record DeviceRegistrationResponse(Guid DeviceId, bool IsNew);
