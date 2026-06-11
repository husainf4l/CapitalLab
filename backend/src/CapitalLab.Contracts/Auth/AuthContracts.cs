namespace CapitalLab.Contracts.Auth;

// ── Requests ─────────────────────────────────────────────────────────────────

public record RegisterPatientRequest(
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    int Gender,
    DateOnly DateOfBirth,
    string Password,
    string ConfirmPassword);

public record LoginRequest(
    string Email,
    string Password,
    bool RememberMe = false);

public record RefreshTokenRequest(
    string AccessToken,
    string RefreshToken);

public record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword,
    string ConfirmPassword);

public record ForgotPasswordRequest(string Email);

public record ResetPasswordRequest(
    string Email,
    string Token,
    string NewPassword,
    string ConfirmPassword);

// ── Responses ─────────────────────────────────────────────────────────────────

public record AuthUserResponse(
    Guid Id,
    string Email,
    string FullName,
    string? AvatarUrl,
    string[] Roles,
    string LanguagePreference);

public record LoginResponse(
    string AccessToken,
    string RefreshToken,
    DateTime AccessTokenExpiresAt,
    DateTime RefreshTokenExpiresAt,
    AuthUserResponse User);
