using CapitalLab.Domain.Common;
using CapitalLab.Domain.Enums;

namespace CapitalLab.Domain.Entities.Inventory;

public class PurchaseOrder : AggregateRoot
{
    public Guid BranchId { get; private set; }
    public string SupplierName { get; private set; } = string.Empty;
    public string OrderNumber { get; private set; } = string.Empty;
    public PurchaseOrderStatus Status { get; private set; } = PurchaseOrderStatus.Draft;
    public decimal TotalAmount { get; private set; }
    public string Currency { get; private set; } = "SAR";
    public DateTime? OrderedAt { get; private set; }
    public DateTime? ReceivedAt { get; private set; }
    public string? Notes { get; private set; }

    public ICollection<PurchaseOrderItem> Items { get; private set; } = [];

    private PurchaseOrder() { }

    public static PurchaseOrder Create(
        string orderNumber,
        Guid branchId,
        string supplierName,
        string currency,
        string? notes)
    {
        if (string.IsNullOrWhiteSpace(supplierName))
            throw new ArgumentException("A supplier is required for a purchase order.", nameof(supplierName));

        return new PurchaseOrder
        {
            Id = Guid.NewGuid(),
            OrderNumber = orderNumber,
            BranchId = branchId,
            SupplierName = supplierName.Trim(),
            Status = PurchaseOrderStatus.Draft,
            Currency = currency.Trim().ToUpperInvariant(),
            Notes = notes?.Trim(),
            TotalAmount = 0m
        };
    }

    public PurchaseOrderItem AddItem(Guid inventoryItemId, decimal quantity, decimal unitCost)
    {
        EnsureStatus(PurchaseOrderStatus.Draft);
        var item = PurchaseOrderItem.Create(Id, inventoryItemId, quantity, unitCost);
        Items.Add(item);
        Recalculate();
        return item;
    }

    private void Recalculate() =>
        TotalAmount = Math.Round(Items.Sum(i => i.TotalCost), 3);

    public void Submit()
    {
        EnsureStatus(PurchaseOrderStatus.Draft);
        if (Items.Count == 0)
            throw new InvalidOperationException("Cannot submit a purchase order with no items.");
        Status = PurchaseOrderStatus.Submitted;
        OrderedAt = DateTime.UtcNow;
    }

    public void Approve()
    {
        EnsureStatus(PurchaseOrderStatus.Submitted);
        Status = PurchaseOrderStatus.Approved;
    }

    public void Receive()
    {
        EnsureStatus(PurchaseOrderStatus.Approved);
        Status = PurchaseOrderStatus.Received;
        ReceivedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        if (Status is PurchaseOrderStatus.Received)
            throw new InvalidOperationException("Cannot cancel a received purchase order.");
        Status = PurchaseOrderStatus.Cancelled;
    }

    private void EnsureStatus(params PurchaseOrderStatus[] allowed)
    {
        if (Array.IndexOf(allowed, Status) < 0)
            throw new InvalidOperationException(
                $"Purchase order in status '{Status}' cannot perform this action; expected one of: {string.Join(", ", allowed)}.");
    }
}
