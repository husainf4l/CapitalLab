using CapitalLab.Domain.Common;
using CapitalLab.Domain.Entities.Catalog;
using CapitalLab.Domain.Enums;

namespace CapitalLab.Domain.Entities.Operations;

public class TestOrderItem : BaseEntity
{
    public Guid TestOrderId { get; private set; }
    public Guid? LabTestId { get; private set; }
    public Guid? HealthPackageId { get; private set; }
    public OrderItemType ItemType { get; private set; }
    public string NameSnapshot { get; private set; } = string.Empty;
    public string CodeSnapshot { get; private set; } = string.Empty;
    public int Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public decimal TotalPrice { get; private set; }
    public string Currency { get; private set; } = "SAR";

    public TestOrder TestOrder { get; private set; } = null!;
    public LabTest? LabTest { get; private set; }
    public HealthPackage? HealthPackage { get; private set; }

    private TestOrderItem() { }

    public static TestOrderItem CreateLabTest(Guid orderId, Guid labTestId, string name, string code, int quantity, decimal unitPrice, string currency) =>
        Create(orderId, labTestId, null, OrderItemType.LabTest, name, code, quantity, unitPrice, 0m, currency);

    public static TestOrderItem CreateHealthPackage(Guid orderId, Guid packageId, string name, string code, int quantity, decimal unitPrice, decimal discountAmount, string currency) =>
        Create(orderId, null, packageId, OrderItemType.HealthPackage, name, code, quantity, unitPrice, discountAmount, currency);

    private static TestOrderItem Create(Guid orderId, Guid? labTestId, Guid? packageId, OrderItemType itemType, string name, string code, int quantity, decimal unitPrice, decimal discountAmount, string currency)
    {
        if (labTestId.HasValue == packageId.HasValue)
            throw new ArgumentException("Item must reference either a lab test or a health package.");
        if (quantity <= 0)
            throw new ArgumentOutOfRangeException(nameof(quantity));

        var gross = Math.Round(unitPrice * quantity, 3);
        var discount = Math.Round(discountAmount, 3);

        return new TestOrderItem
        {
            Id = Guid.NewGuid(),
            TestOrderId = orderId,
            LabTestId = labTestId,
            HealthPackageId = packageId,
            ItemType = itemType,
            NameSnapshot = name.Trim(),
            CodeSnapshot = code.Trim().ToUpperInvariant(),
            Quantity = quantity,
            UnitPrice = Math.Round(unitPrice, 3),
            DiscountAmount = discount,
            TotalPrice = Math.Round(gross - discount, 3),
            Currency = currency.Trim().ToUpperInvariant()
        };
    }
}
