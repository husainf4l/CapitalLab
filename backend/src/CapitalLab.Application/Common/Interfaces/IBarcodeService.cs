namespace CapitalLab.Application.Common.Interfaces;

/// <summary>The encoded barcode value plus the storage path where its rendered image lives (rendering deferred).</summary>
public sealed record BarcodeResult(string Value, string ImagePath);

public interface IBarcodeService
{
    /// <summary>Produces a Code128-compatible barcode value for the given content and a deterministic image path.</summary>
    BarcodeResult Generate(string content);
}
