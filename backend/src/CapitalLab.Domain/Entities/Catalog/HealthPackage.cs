using CapitalLab.Domain.Common;

namespace CapitalLab.Domain.Entities.Catalog;

public class HealthPackage : AggregateRoot
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? NameAr { get; private set; }
    public string? Description { get; private set; }
    public decimal Price { get; private set; }
    public string Currency { get; private set; } = "SAR";
    public decimal DiscountPercentage { get; private set; }
    public bool IsPopular { get; private set; }
    public bool IsActive { get; private set; } = true;

    // Navigation
    public ICollection<PackageTest> PackageTests { get; private set; } = [];

    private HealthPackage() { }

    public static HealthPackage Create(
        string code, string name, string? nameAr,
        string? description, decimal price, string currency,
        decimal discountPercentage = 0, bool isPopular = false)
    {
        if (price < 0) throw new ArgumentOutOfRangeException(nameof(price));
        if (discountPercentage is < 0 or > 100)
            throw new ArgumentOutOfRangeException(nameof(discountPercentage), "Discount must be 0–100.");

        return new HealthPackage
        {
            Id = Guid.NewGuid(),
            Code = code.Trim().ToUpperInvariant(),
            Name = name.Trim(),
            NameAr = nameAr?.Trim(),
            Description = description?.Trim(),
            Price = Math.Round(price, 3),
            Currency = currency.Trim().ToUpperInvariant(),
            DiscountPercentage = discountPercentage,
            IsPopular = isPopular,
            IsActive = true
        };
    }

    public void Update(
        string name, string? nameAr, string? description,
        decimal price, string currency,
        decimal discountPercentage, bool isPopular)
    {
        if (price < 0) throw new ArgumentOutOfRangeException(nameof(price));

        Name = name.Trim();
        NameAr = nameAr?.Trim();
        Description = description?.Trim();
        Price = Math.Round(price, 3);
        Currency = currency.Trim().ToUpperInvariant();
        DiscountPercentage = discountPercentage;
        IsPopular = isPopular;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    public decimal EffectivePrice =>
        DiscountPercentage > 0
            ? Math.Round(Price * (1 - DiscountPercentage / 100), 3)
            : Price;
}
