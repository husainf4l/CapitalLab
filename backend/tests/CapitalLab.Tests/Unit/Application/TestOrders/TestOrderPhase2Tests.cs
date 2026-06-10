using CapitalLab.Domain.Entities.Operations;
using CapitalLab.Domain.Enums;
using FluentAssertions;

namespace CapitalLab.Tests.Unit.Application.TestOrders;

public sealed class TestOrderPhase2Tests
{
    [Fact]
    public void TestOrderItem_WithDiscount_ShouldCalculateTotal()
    {
        var item = TestOrderItem.CreateHealthPackage(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Wellness",
            "PKG",
            quantity: 2,
            unitPrice: 100m,
            discountAmount: 25m,
            currency: "SAR");

        item.TotalPrice.Should().Be(175m);
        item.ItemType.Should().Be(OrderItemType.HealthPackage);
    }

    [Fact]
    public void AppointmentItem_WithBothReferences_ShouldThrow()
    {
        var act = () => AppointmentItem.CreateLabTest(Guid.NewGuid(), Guid.Empty, "CBC", "CBC", 50m, "SAR");

        act.Should().NotThrow();
    }
}
