using System.Security.Cryptography;
using System.Text;
using CapitalLab.Application.Common.Interfaces;

namespace CapitalLab.Infrastructure.Services.Laboratory;

/// <summary>
/// Produces barcode values and deterministic image paths. The barcode value is the supplied
/// content (already unique, e.g. the sample number); the actual image rendering is deferred to a
/// later phase. The image path is stable for a given content so re-generation is idempotent.
/// </summary>
public sealed class BarcodeService : IBarcodeService
{
    public BarcodeResult Generate(string content)
    {
        if (string.IsNullOrWhiteSpace(content))
            throw new ArgumentException("Barcode content cannot be empty.", nameof(content));

        var value = content.Trim();
        var slug = Slugify(value);
        var imagePath = $"barcodes/{slug}.svg";
        return new BarcodeResult(value, imagePath);
    }

    private static string Slugify(string input)
    {
        var sb = new StringBuilder(input.Length);
        foreach (var c in input)
            sb.Append(char.IsLetterOrDigit(c) ? char.ToLowerInvariant(c) : '-');
        var slug = sb.ToString();
        // Guard against pathological lengths
        if (slug.Length > 80)
        {
            var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(input)))[..16].ToLowerInvariant();
            slug = $"{slug[..63]}-{hash}";
        }
        return slug;
    }
}
