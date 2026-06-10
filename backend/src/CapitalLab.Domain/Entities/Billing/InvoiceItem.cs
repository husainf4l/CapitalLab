using CapitalLab.Domain.Common;
using CapitalLab.Domain.Enums;

namespace CapitalLab.Domain.Entities.Billing;

public class InvoiceItem : AuditableEntity
{
    public Guid InvoiceId { get; private set; }
    public string Description { get; private set; } = string.Empty;
    public InvoiceItemType ItemType { get; private set; }
    public Guid? ReferenceId { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public decimal TotalPrice { get; private set; }

    public Invoice Invoice { get; private set; } = null!;

    private InvoiceItem() { }

    internal static InvoiceItem Create(
        Guid invoiceId,
        string description,
        InvoiceItemType itemType,
        Guid? referenceId,
        decimal quantity,
        decimal unitPrice,
        decimal discountAmount)
    {
        if (quantity <= 0) throw new ArgumentOutOfRangeException(nameof(quantity), "Quantity must be positive.");
        if (unitPrice < 0) throw new ArgumentOutOfRangeException(nameof(unitPrice));
        if (discountAmount < 0) throw new ArgumentOutOfRangeException(nameof(discountAmount));

        var gross = quantity * unitPrice;
        if (discountAmount > gross)
            throw new ArgumentException("Item discount cannot exceed the line total.", nameof(discountAmount));

        return new InvoiceItem
        {
            Id = Guid.NewGuid(),
            InvoiceId = invoiceId,
            Description = description.Trim(),
            ItemType = itemType,
            ReferenceId = referenceId,
            Quantity = Math.Round(quantity, 3),
            UnitPrice = Math.Round(unitPrice, 3),
            DiscountAmount = Math.Round(discountAmount, 3),
            TotalPrice = Math.Round(gross - discountAmount, 3)
        };
    }
}
