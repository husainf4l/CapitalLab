using CapitalLab.Domain.Common;

namespace CapitalLab.Domain.Entities.Catalog;

public class TestCategory : AggregateRoot
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? NameAr { get; private set; }
    public string? Description { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; } = true;

    // Navigation
    public ICollection<LabTest> LabTests { get; private set; } = [];

    private TestCategory() { }

    public static TestCategory Create(
        string code, string name, string? nameAr,
        string? description, int sortOrder = 0)
    {
        return new TestCategory
        {
            Id = Guid.NewGuid(),
            Code = code.Trim().ToUpperInvariant(),
            Name = name.Trim(),
            NameAr = nameAr?.Trim(),
            Description = description?.Trim(),
            SortOrder = sortOrder,
            IsActive = true
        };
    }

    public void Update(string name, string? nameAr, string? description, int sortOrder)
    {
        Name = name.Trim();
        NameAr = nameAr?.Trim();
        Description = description?.Trim();
        SortOrder = sortOrder;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
