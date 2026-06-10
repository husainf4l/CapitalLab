namespace CapitalLab.Infrastructure.Identity;

/// <summary>
/// JWT configuration model. Bound from appsettings.json "Jwt" section.
/// Uses RSA (RS256) signing: private key signs, public key verifies.
/// Both keys are Base64-encoded PEM strings.
/// </summary>
public sealed class JwtSettings
{
    public const string SectionName = "Jwt";

    public string Issuer { get; init; } = string.Empty;
    public string Audience { get; init; } = string.Empty;

    /// <summary>Base64-encoded RSA private key PEM (PKCS#8). Used for signing tokens.</summary>
    public string PrivateKeyBase64 { get; init; } = string.Empty;

    /// <summary>Base64-encoded RSA public key PEM. Used for token validation.</summary>
    public string PublicKeyBase64 { get; init; } = string.Empty;

    /// <summary>Access token lifetime in minutes. Default: 15.</summary>
    public int AccessTokenLifetimeMinutes { get; init; } = 15;

    /// <summary>Refresh token lifetime in days. Default: 7.</summary>
    public int RefreshTokenLifetimeDays { get; init; } = 7;
}
