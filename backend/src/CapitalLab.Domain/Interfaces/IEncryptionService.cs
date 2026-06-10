namespace CapitalLab.Domain.Interfaces;

/// <summary>
/// Provides field-level AES-256 encryption for sensitive PII columns.
/// Implemented in Infrastructure. Referenced here so Domain can define EncryptedString operations.
/// </summary>
public interface IEncryptionService
{
    string Encrypt(string plainText);
    string Decrypt(string cipherText);
    string HashOneWay(string value);
    bool VerifyHash(string value, string hash);
}
