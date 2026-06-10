using CapitalLab.Domain.Common;
using CapitalLab.Domain.Enums;

namespace CapitalLab.Domain.Entities.Catalog;

public class LabTest : AggregateRoot
{
    public Guid CategoryId { get; private set; }
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? NameAr { get; private set; }
    public string? Description { get; private set; }
    public SampleType SampleType { get; private set; }
    public string? PreparationInstructions { get; private set; }
    public int TurnaroundTimeHours { get; private set; }
    public decimal Price { get; private set; }
    public string Currency { get; private set; } = "SAR";
    public string? ReferenceRange { get; private set; }
    public string? Unit { get; private set; }
    public bool IsFastingRequired { get; private set; }
    public bool IsHomeCollectionAvailable { get; private set; }
    public bool IsActive { get; private set; } = true;

    // Navigation
    public TestCategory Category { get; private set; } = null!;
    public ICollection<PackageTest> PackageTests { get; private set; } = [];

    private LabTest() { }

    public static LabTest Create(
        Guid categoryId, string code, string name, string? nameAr,
        string? description, SampleType sampleType,
        string? preparationInstructions, int turnaroundTimeHours,
        decimal price, string currency,
        string? referenceRange, string? unit,
        bool isFastingRequired, bool isHomeCollectionAvailable)
    {
        if (price < 0) throw new ArgumentOutOfRangeException(nameof(price), "Price cannot be negative.");
        if (turnaroundTimeHours < 0) throw new ArgumentOutOfRangeException(nameof(turnaroundTimeHours));

        return new LabTest
        {
            Id = Guid.NewGuid(),
            CategoryId = categoryId,
            Code = code.Trim().ToUpperInvariant(),
            Name = name.Trim(),
            NameAr = nameAr?.Trim(),
            Description = description?.Trim(),
            SampleType = sampleType,
            PreparationInstructions = preparationInstructions?.Trim(),
            TurnaroundTimeHours = turnaroundTimeHours,
            Price = Math.Round(price, 3),
            Currency = currency.Trim().ToUpperInvariant(),
            ReferenceRange = referenceRange?.Trim(),
            Unit = unit?.Trim(),
            IsFastingRequired = isFastingRequired,
            IsHomeCollectionAvailable = isHomeCollectionAvailable,
            IsActive = true
        };
    }

    public void Update(
        Guid categoryId, string name, string? nameAr,
        string? description, SampleType sampleType,
        string? preparationInstructions, int turnaroundTimeHours,
        decimal price, string currency,
        string? referenceRange, string? unit,
        bool isFastingRequired, bool isHomeCollectionAvailable)
    {
        if (price < 0) throw new ArgumentOutOfRangeException(nameof(price));

        CategoryId = categoryId;
        Name = name.Trim();
        NameAr = nameAr?.Trim();
        Description = description?.Trim();
        SampleType = sampleType;
        PreparationInstructions = preparationInstructions?.Trim();
        TurnaroundTimeHours = turnaroundTimeHours;
        Price = Math.Round(price, 3);
        Currency = currency.Trim().ToUpperInvariant();
        ReferenceRange = referenceRange?.Trim();
        Unit = unit?.Trim();
        IsFastingRequired = isFastingRequired;
        IsHomeCollectionAvailable = isHomeCollectionAvailable;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
