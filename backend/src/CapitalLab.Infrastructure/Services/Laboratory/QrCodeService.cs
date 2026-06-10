using System.Security.Cryptography;
using System.Text;
using CapitalLab.Application.Common.Interfaces;

namespace CapitalLab.Infrastructure.Services.Laboratory;

/// <summary>
/// Generates opaque, collision-resistant QR verification tokens used to validate report/sample
/// authenticity. The token is derived from the payload plus cryptographic randomness; the image
/// rendering is deferred to a later phase. Only the value and image path are returned here.
/// </summary>
public sealed class QrCodeService : IQrCodeService
{
    public QrCodeResult GenerateVerification(string payload)
    {
        var randomBytes = RandomNumberGenerator.GetBytes(16);
        var material = Encoding.UTF8.GetBytes(payload ?? string.Empty).Concat(randomBytes).ToArray();
        var digest = SHA256.HashData(material);
        var token = Convert.ToHexString(digest)[..32].ToUpperInvariant();
        var imagePath = $"qrcodes/{token.ToLowerInvariant()}.svg";
        return new QrCodeResult(token, imagePath);
    }
}
