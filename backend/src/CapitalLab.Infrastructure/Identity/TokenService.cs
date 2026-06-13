using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using CapitalLab.Application.Common.Interfaces;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

namespace CapitalLab.Infrastructure.Identity;

public sealed class TokenService(IOptions<JwtSettings> jwtOptions, IDateTimeService dateTime)
    : ITokenService
{
    private readonly JwtSettings _settings = jwtOptions.Value;

    public DateTime AccessTokenExpiry => dateTime.UtcNow.AddMinutes(_settings.AccessTokenLifetimeMinutes);
    public DateTime RefreshTokenExpiry => dateTime.UtcNow.AddDays(_settings.RefreshTokenLifetimeDays);

    public string GenerateAccessToken(
        Guid userId,
        string email,
        string fullName,
        IEnumerable<string> roles,
        IEnumerable<string> permissions,
        Guid? branchId = null,
        Guid? labId = null)
    {
        using var rsa = RSA.Create();
        rsa.ImportFromPem(Encoding.UTF8.GetString(Convert.FromBase64String(_settings.PrivateKeyBase64)));

        var signingKey = new RsaSecurityKey(rsa.ExportParameters(true)) { KeyId = "capitallab-rs256" };
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.RsaSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.Email, email),
            new(JwtRegisteredClaimNames.Name, fullName),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(JwtRegisteredClaimNames.Iat,
                new DateTimeOffset(dateTime.UtcNow).ToUnixTimeSeconds().ToString(),
                ClaimValueTypes.Integer64),
        };

        foreach (var role in roles)
            claims.Add(new Claim(ClaimTypes.Role, role));

        foreach (var permission in permissions)
            claims.Add(new Claim("permissions", permission));

        if (branchId.HasValue)
            claims.Add(new Claim("branchId", branchId.Value.ToString()));

        if (labId.HasValue)
            claims.Add(new Claim("labId", labId.Value.ToString()));

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            notBefore: dateTime.UtcNow,
            expires: AccessTokenExpiry,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes);
    }

    public ClaimsPrincipal? ValidateToken(string token, bool validateLifetime = true)
    {
        using var rsa = RSA.Create();
        rsa.ImportFromPem(Encoding.UTF8.GetString(Convert.FromBase64String(_settings.PublicKeyBase64)));

        var validationParams = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new RsaSecurityKey(rsa.ExportParameters(false)) { KeyId = "capitallab-rs256" },
            ValidateIssuer = true,
            ValidIssuer = _settings.Issuer,
            ValidateAudience = true,
            ValidAudience = _settings.Audience,
            ValidateLifetime = validateLifetime,
            ClockSkew = TimeSpan.FromSeconds(30),
        };

        try
        {
            return new JwtSecurityTokenHandler().ValidateToken(token, validationParams, out _);
        }
        catch
        {
            return null;
        }
    }

    public string HashRefreshToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToBase64String(bytes);
    }
}
