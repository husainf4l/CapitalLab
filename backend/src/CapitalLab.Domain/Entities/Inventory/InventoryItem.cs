using CapitalLab.Domain.Common;

namespace CapitalLab.Domain.Entities.Inventory;

public class InventoryItem : AggregateRoot
{
    public Guid BranchId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Code { get; private set; } = string.Empty;
    public string Category { get; private set; } = string.Empty;
    public string Unit { get; private set; } = string.Empty;
    public decimal CurrentStock { get; private set; }
    public decimal MinimumStock { get; private set; }
    public decimal MaximumStock { get; private set; }
    public decimal CostPrice { get; private set; }
    public string? SupplierName { get; private set; }
    public DateOnly? ExpiryDate { get; private set; }
    public string? BatchNumber { get; private set; }
    public bool IsActive { get; private set; } = true;

    private InventoryItem() { }

    public static InventoryItem Create(
        Guid branchId,
        string name,
        string code,
        string category,
        string unit,
        decimal initialStock,
        decimal minimumStock,
        decimal maximumStock,
        decimal costPrice,
        string? supplierName,
        DateOnly? expiryDate,
        string? batchNumber)
    {
        if (initialStock < 0) throw new ArgumentOutOfRangeException(nameof(initialStock));
        if (minimumStock < 0) throw new ArgumentOutOfRangeException(nameof(minimumStock));
        if (costPrice < 0) throw new ArgumentOutOfRangeException(nameof(costPrice));

        return new InventoryItem
        {
            Id = Guid.NewGuid(),
            BranchId = branchId,
            Name = name.Trim(),
            Code = code.Trim().ToUpperInvariant(),
            Category = category.Trim(),
            Unit = unit.Trim(),
            CurrentStock = Math.Round(initialStock, 3),
            MinimumStock = Math.Round(minimumStock, 3),
            MaximumStock = Math.Round(maximumStock, 3),
            CostPrice = Math.Round(costPrice, 3),
            SupplierName = supplierName?.Trim(),
            ExpiryDate = expiryDate,
            BatchNumber = batchNumber?.Trim(),
            IsActive = true
        };
    }

    public void Update(
        string name,
        string category,
        string unit,
        decimal minimumStock,
        decimal maximumStock,
        decimal costPrice,
        string? supplierName,
        DateOnly? expiryDate,
        string? batchNumber)
    {
        if (minimumStock < 0) throw new ArgumentOutOfRangeException(nameof(minimumStock));
        if (costPrice < 0) throw new ArgumentOutOfRangeException(nameof(costPrice));

        Name = name.Trim();
        Category = category.Trim();
        Unit = unit.Trim();
        MinimumStock = Math.Round(minimumStock, 3);
        MaximumStock = Math.Round(maximumStock, 3);
        CostPrice = Math.Round(costPrice, 3);
        SupplierName = supplierName?.Trim();
        ExpiryDate = expiryDate;
        BatchNumber = batchNumber?.Trim();
    }

    /// <summary>Adds quantity to stock (StockIn / Transfer-in / receive).</summary>
    public void ReceiveStock(decimal quantity)
    {
        if (quantity <= 0) throw new ArgumentOutOfRangeException(nameof(quantity), "Quantity must be positive.");
        CurrentStock = Math.Round(CurrentStock + quantity, 3);
    }

    /// <summary>Removes quantity from stock (StockOut / Transfer-out / Expired / Damaged). Cannot go below zero.</summary>
    public void IssueStock(decimal quantity)
    {
        if (quantity <= 0) throw new ArgumentOutOfRangeException(nameof(quantity), "Quantity must be positive.");
        if (quantity > CurrentStock)
            throw new InvalidOperationException("Insufficient stock. Use an adjustment to set stock below current usage.");
        CurrentStock = Math.Round(CurrentStock - quantity, 3);
    }

    /// <summary>Sets stock to an absolute value. A reason is mandatory for adjustments.</summary>
    public void AdjustStock(decimal newQuantity, string reason)
    {
        if (newQuantity < 0) throw new ArgumentOutOfRangeException(nameof(newQuantity), "Stock cannot be negative.");
        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("An adjustment reason is required.", nameof(reason));
        CurrentStock = Math.Round(newQuantity, 3);
    }

    public void Deactivate() => IsActive = false;
    public void Activate() => IsActive = true;

    public bool IsLowStock => IsActive && CurrentStock <= MinimumStock;

    public bool IsExpiringWithin(int days, DateOnly today) =>
        ExpiryDate.HasValue && ExpiryDate.Value <= today.AddDays(days);

    public decimal StockValue => Math.Round(CurrentStock * CostPrice, 3);
}
