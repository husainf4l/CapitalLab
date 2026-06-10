using CapitalLab.Contracts.Inventory;
using CapitalLab.Domain.Entities.Inventory;
using DomainEnums = CapitalLab.Domain.Enums;
using ContractEnums = CapitalLab.Contracts.Enums;

namespace CapitalLab.Application.Features.Inventory;

internal static class InventoryMapping
{
    public static InventoryItemResponse ToResponse(this InventoryItem i, DateOnly today) => new(
        i.Id, i.BranchId, i.Name, i.Code, i.Category, i.Unit,
        i.CurrentStock, i.MinimumStock, i.MaximumStock, i.CostPrice, i.StockValue,
        i.SupplierName, i.ExpiryDate, i.BatchNumber, i.IsLowStock, i.IsActive, i.CreatedAt);

    public static InventoryTransactionResponse ToResponse(this InventoryTransaction t) => new(
        t.Id, t.InventoryItemId, t.BranchId,
        (ContractEnums.InventoryTransactionType)t.TransactionType,
        t.Quantity, t.UnitCost, t.TotalCost, t.Reason, t.ReferenceNumber, t.CreatedAt);

    public static PurchaseOrderResponse ToResponse(this PurchaseOrder p) => new(
        p.Id, p.OrderNumber, p.BranchId, p.SupplierName,
        (ContractEnums.PurchaseOrderStatus)p.Status,
        p.TotalAmount, p.Currency, p.OrderedAt, p.ReceivedAt, p.Notes,
        p.Items.Select(x => new PurchaseOrderItemResponse(x.Id, x.InventoryItemId, x.Quantity, x.UnitCost, x.TotalCost)).ToList(),
        p.CreatedAt);
}
