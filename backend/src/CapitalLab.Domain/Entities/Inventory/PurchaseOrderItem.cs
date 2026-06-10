using CapitalLab.Domain.Common;

namespace CapitalLab.Domain.Entities.Inventory;

public class PurchaseOrderItem : AuditableEntity
{
    public Guid PurchaseOrderId { get; private set; }
    public Guid InventoryItemId { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal UnitCost { get; private set; }
    public decimal TotalCost { get; private set; }

    public PurchaseOrder PurchaseOrder { get; private set; } = null!;

    private PurchaseOrderItem() { }

    internal static PurchaseOrderItem Create(
        Guid purchaseOrderId,
        Guid inventoryItemId,
        decimal quantity,
        decimal unitCost)
    {
        if (quantity <= 0) throw new ArgumentOutOfRangeException(nameof(quantity), "Quantity must be positive.");
        if (unitCost < 0) throw new ArgumentOutOfRangeException(nameof(unitCost));

        return new PurchaseOrderItem
        {
            Id = Guid.NewGuid(),
            PurchaseOrderId = purchaseOrderId,
            InventoryItemId = inventoryItemId,
            Quantity = Math.Round(quantity, 3),
            UnitCost = Math.Round(unitCost, 3),
            TotalCost = Math.Round(quantity * unitCost, 3)
        };
    }
}
