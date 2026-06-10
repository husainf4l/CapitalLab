namespace CapitalLab.Application.Common.Interfaces;

public record TokenPair(
    string AccessToken,
    string RefreshToken,
    DateTime AccessTokenExpiresAt,
    DateTime RefreshTokenExpiresAt);

public interface ITokenService
{
    /// <summary>Generate RS256-signed JWT access token.</summary>
    string GenerateAccessToken(
        Guid userId,
        string email,
        string fullName,
        IEnumerable<string> roles,
        IEnumerable<string> permissions,
        Guid? branchId = null,
        Guid? labId = null);

    /// <summary>Generate cryptographically random opaque refresh token.</summary>
    string GenerateRefreshToken();

    /// <summary>Validate and extract claims from an expired or valid access token.</summary>
    System.Security.Claims.ClaimsPrincipal? ValidateToken(string token, bool validateLifetime = true);

    string HashRefreshToken(string token);
    DateTime AccessTokenExpiry { get; }
    DateTime RefreshTokenExpiry { get; }
}
