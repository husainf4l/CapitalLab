using CapitalLab.Domain.Common;
using CapitalLab.Domain.Entities.Catalog;
using CapitalLab.Domain.Enums;

namespace CapitalLab.Domain.Entities.Operations;

public class AppointmentItem : BaseEntity
{
    public Guid AppointmentId { get; private set; }
    public Guid? LabTestId { get; private set; }
    public Guid? HealthPackageId { get; private set; }
    public OrderItemType ItemType { get; private set; }
    public string NameSnapshot { get; private set; } = string.Empty;
    public string CodeSnapshot { get; private set; } = string.Empty;
    public decimal PriceSnapshot { get; private set; }
    public string CurrencySnapshot { get; private set; } = "SAR";

    public Appointment Appointment { get; private set; } = null!;
    public LabTest? LabTest { get; private set; }
    public HealthPackage? HealthPackage { get; private set; }

    private AppointmentItem() { }

    public static AppointmentItem CreateLabTest(Guid appointmentId, Guid labTestId, string name, string code, decimal price, string currency) =>
        Create(appointmentId, labTestId, null, OrderItemType.LabTest, name, code, price, currency);

    public static AppointmentItem CreateHealthPackage(Guid appointmentId, Guid packageId, string name, string code, decimal price, string currency) =>
        Create(appointmentId, null, packageId, OrderItemType.HealthPackage, name, code, price, currency);

    private static AppointmentItem Create(Guid appointmentId, Guid? labTestId, Guid? packageId, OrderItemType itemType, string name, string code, decimal price, string currency)
    {
        if (labTestId.HasValue == packageId.HasValue)
            throw new ArgumentException("Item must reference either a lab test or a health package.");
        if (price < 0)
            throw new ArgumentOutOfRangeException(nameof(price));

        return new AppointmentItem
        {
            Id = Guid.NewGuid(),
            AppointmentId = appointmentId,
            LabTestId = labTestId,
            HealthPackageId = packageId,
            ItemType = itemType,
            NameSnapshot = name.Trim(),
            CodeSnapshot = code.Trim().ToUpperInvariant(),
            PriceSnapshot = Math.Round(price, 3),
            CurrencySnapshot = currency.Trim().ToUpperInvariant()
        };
    }
}
