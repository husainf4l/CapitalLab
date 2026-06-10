using CapitalLab.Domain.Common;
using CapitalLab.Domain.Enums;

namespace CapitalLab.Domain.Entities.Inventory;

public class InventoryTransaction : AggregateRoot
{
    public Guid InventoryItemId { get; private set; }
    public Guid BranchId { get; private set; }
    public InventoryTransactionType TransactionType { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal UnitCost { get; private set; }
    public decimal TotalCost { get; private set; }
    public string? Reason { get; private set; }
    public string? ReferenceNumber { get; private set; }

    private InventoryTransaction() { }

    public static InventoryTransaction Create(
        Guid inventoryItemId,
        Guid branchId,
        InventoryTransactionType transactionType,
        decimal quantity,
        decimal unitCost,
        string? reason,
        string? referenceNumber)
    {
        if (quantity <= 0) throw new ArgumentOutOfRangeException(nameof(quantity), "Quantity must be positive.");
        if (unitCost < 0) throw new ArgumentOutOfRangeException(nameof(unitCost));

        return new InventoryTransaction
        {
            Id = Guid.NewGuid(),
            InventoryItemId = inventoryItemId,
            BranchId = branchId,
            TransactionType = transactionType,
            Quantity = Math.Round(quantity, 3),
            UnitCost = Math.Round(unitCost, 3),
            TotalCost = Math.Round(quantity * unitCost, 3),
            Reason = reason?.Trim(),
            ReferenceNumber = referenceNumber?.Trim()
        };
    }
}
