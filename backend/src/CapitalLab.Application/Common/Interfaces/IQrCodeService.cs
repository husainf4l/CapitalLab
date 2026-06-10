namespace CapitalLab.Application.Common.Interfaces;

/// <summary>The opaque QR verification value plus the storage path where its rendered image lives (rendering deferred).</summary>
public sealed record QrCodeResult(string Value, string ImagePath);

public interface IQrCodeService
{
    /// <summary>Generates a unique, opaque verification token for report/sample authenticity checks.</summary>
    QrCodeResult GenerateVerification(string payload);
}
