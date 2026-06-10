using System.Security.Cryptography;
using System.Text;
using CapitalLab.Domain.Interfaces;
using Microsoft.Extensions.Configuration;

namespace CapitalLab.Infrastructure.Services;

/// <summary>
/// AES-256-GCM field-level encryption for sensitive PII (national ID, passport, policy numbers).
/// The encryption key is stored in the "Encryption:Key" configuration (Base64, 32 bytes).
/// </summary>
public sealed class EncryptionService(IConfiguration configuration) : IEncryptionService
{
    private readonly byte[] _key = Convert.FromBase64String(
        configuration["Encryption:Key"]
        ?? throw new InvalidOperationException("Encryption:Key is not configured."));

    public string Encrypt(string plainText)
    {
        ArgumentException.ThrowIfNullOrEmpty(plainText);

        var plainBytes = Encoding.UTF8.GetBytes(plainText);
        var nonce = RandomNumberGenerator.GetBytes(AesGcm.NonceByteSizes.MaxSize);
        var tag = new byte[AesGcm.TagByteSizes.MaxSize];
        var cipherBytes = new byte[plainBytes.Length];

        using var aes = new AesGcm(_key, AesGcm.TagByteSizes.MaxSize);
        aes.Encrypt(nonce, plainBytes, cipherBytes, tag);

        // Format: Base64(nonce) + "." + Base64(tag) + "." + Base64(ciphertext)
        return $"{Convert.ToBase64String(nonce)}.{Convert.ToBase64String(tag)}.{Convert.ToBase64String(cipherBytes)}";
    }

    public string Decrypt(string cipherText)
    {
        ArgumentException.ThrowIfNullOrEmpty(cipherText);

        var parts = cipherText.Split('.');
        if (parts.Length != 3)
            throw new CryptographicException("Invalid ciphertext format.");

        var nonce = Convert.FromBase64String(parts[0]);
        var tag = Convert.FromBase64String(parts[1]);
        var cipherBytes = Convert.FromBase64String(parts[2]);
        var plainBytes = new byte[cipherBytes.Length];

        using var aes = new AesGcm(_key, AesGcm.TagByteSizes.MaxSize);
        aes.Decrypt(nonce, cipherBytes, tag, plainBytes);

        return Encoding.UTF8.GetString(plainBytes);
    }

    public string HashOneWay(string value)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return Convert.ToBase64String(bytes);
    }

    public bool VerifyHash(string value, string hash) =>
        HashOneWay(value) == hash;
}
