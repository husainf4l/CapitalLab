using CapitalLab.Domain.Entities.Inventory;
using FluentAssertions;

namespace CapitalLab.Tests.Unit.Domain.Business;

public sealed class InventoryItemTests
{
    private static InventoryItem NewItem(decimal stock = 100, decimal min = 10) =>
        InventoryItem.Create(Guid.NewGuid(), "Reagent A", "RG-A", "Reagents", "vial",
            stock, min, 500, 12.5m, "Acme", null, "B-001");

    [Fact]
    public void ReceiveStock_IncreasesStock()
    {
        var item = NewItem(stock: 100);
        item.ReceiveStock(50);
        item.CurrentStock.Should().Be(150);
    }

    [Fact]
    public void IssueStock_DecreasesStock()
    {
        var item = NewItem(stock: 100);
        item.IssueStock(30);
        item.CurrentStock.Should().Be(70);
    }

    [Fact]
    public void IssueStock_BeyondAvailable_Throws()
    {
        var item = NewItem(stock: 20);
        var act = () => item.IssueStock(50);
        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void IssueStock_NegativeQuantity_Throws()
    {
        var item = NewItem();
        var act = () => item.IssueStock(-5);
        act.Should().Throw<ArgumentOutOfRangeException>();
    }

    [Fact]
    public void AdjustStock_WithoutReason_Throws()
    {
        var item = NewItem();
        var act = () => item.AdjustStock(5, "");
        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void AdjustStock_WithReason_SetsAbsoluteValue()
    {
        var item = NewItem(stock: 100);
        item.AdjustStock(7, "Stocktake correction");
        item.CurrentStock.Should().Be(7);
    }

    [Fact]
    public void IsLowStock_True_WhenAtOrBelowMinimum()
    {
        var item = NewItem(stock: 10, min: 10);
        item.IsLowStock.Should().BeTrue();
    }

    [Fact]
    public void IsLowStock_False_WhenAboveMinimum()
    {
        var item = NewItem(stock: 50, min: 10);
        item.IsLowStock.Should().BeFalse();
    }

    [Fact]
    public void IsExpiringWithin_DetectsNearExpiry()
    {
        var today = new DateOnly(2026, 6, 10);
        var item = InventoryItem.Create(Guid.NewGuid(), "Kit", "KIT-1", "Kits", "box",
            5, 1, 10, 4m, null, today.AddDays(15), null);
        item.IsExpiringWithin(30, today).Should().BeTrue();
        item.IsExpiringWithin(7, today).Should().BeFalse();
    }

    [Fact]
    public void StockValue_IsStockTimesCost()
    {
        var item = NewItem(stock: 10);
        item.StockValue.Should().Be(125m); // 10 * 12.5
    }
}
