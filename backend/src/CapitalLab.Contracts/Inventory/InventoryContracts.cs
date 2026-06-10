using CapitalLab.Contracts.Enums;

namespace CapitalLab.Contracts.Inventory;

// ── Requests ──────────────────────────────────────────────────────────────────
public record CreateInventoryItemRequest(
    Guid BranchId,
    string Name,
    string Code,
    string Category,
    string Unit,
    decimal InitialStock,
    decimal MinimumStock,
    decimal MaximumStock,
    decimal CostPrice,
    string? SupplierName,
    DateOnly? ExpiryDate,
    string? BatchNumber);

public record UpdateInventoryItemRequest(
    string Name,
    string Category,
    string Unit,
    decimal MinimumStock,
    decimal MaximumStock,
    decimal CostPrice,
    string? SupplierName,
    DateOnly? ExpiryDate,
    string? BatchNumber);

public record StockMovementRequest(decimal Quantity, decimal UnitCost, string? Reason, string? ReferenceNumber);

public record StockAdjustRequest(decimal NewQuantity, string Reason);

public record CreatePurchaseOrderItemRequest(Guid InventoryItemId, decimal Quantity, decimal UnitCost);

public record CreatePurchaseOrderRequest(
    Guid BranchId,
    string SupplierName,
    string Currency,
    string? Notes,
    List<CreatePurchaseOrderItemRequest> Items);

// ── Responses ─────────────────────────────────────────────────────────────────
public record InventoryItemResponse(
    Guid Id,
    Guid BranchId,
    string Name,
    string Code,
    string Category,
    string Unit,
    decimal CurrentStock,
    decimal MinimumStock,
    decimal MaximumStock,
    decimal CostPrice,
    decimal StockValue,
    string? SupplierName,
    DateOnly? ExpiryDate,
    string? BatchNumber,
    bool IsLowStock,
    bool IsActive,
    DateTime CreatedAt);

public record InventoryTransactionResponse(
    Guid Id,
    Guid InventoryItemId,
    Guid BranchId,
    InventoryTransactionType TransactionType,
    decimal Quantity,
    decimal UnitCost,
    decimal TotalCost,
    string? Reason,
    string? ReferenceNumber,
    DateTime CreatedAt);

public record PurchaseOrderItemResponse(
    Guid Id,
    Guid InventoryItemId,
    decimal Quantity,
    decimal UnitCost,
    decimal TotalCost);

public record PurchaseOrderResponse(
    Guid Id,
    string OrderNumber,
    Guid BranchId,
    string SupplierName,
    PurchaseOrderStatus Status,
    decimal TotalAmount,
    string Currency,
    DateTime? OrderedAt,
    DateTime? ReceivedAt,
    string? Notes,
    List<PurchaseOrderItemResponse> Items,
    DateTime CreatedAt);
