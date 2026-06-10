namespace CapitalLab.Domain.Common.ValueObjects;

/// <summary>
/// Wraps an AES-256 encrypted ciphertext.
/// Encryption/decryption is delegated to IEncryptionService in Infrastructure.
/// This value object only stores the ciphertext — it has no knowledge of keys.
/// </summary>
public sealed class EncryptedString : ValueObject
{
    public string CipherText { get; }

    private EncryptedString() { CipherText = string.Empty; }

    public EncryptedString(string cipherText)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(cipherText);
        CipherText = cipherText;
    }

    public override string ToString() => "***";

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return CipherText;
    }
}
