using CapitalLab.Domain.Common;

namespace CapitalLab.Domain.Entities.Catalog;

public class PackageTest : BaseEntity
{
    public Guid PackageId { get; private set; }
    public Guid LabTestId { get; private set; }

    // Navigation
    public HealthPackage Package { get; private set; } = null!;
    public LabTest LabTest { get; private set; } = null!;

    private PackageTest() { }

    public static PackageTest Create(Guid packageId, Guid labTestId)
    {
        return new PackageTest
        {
            Id = Guid.NewGuid(),
            PackageId = packageId,
            LabTestId = labTestId
        };
    }
}
