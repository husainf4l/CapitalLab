using CapitalLab.Domain.Entities.Inventory;
using CapitalLab.Domain.Enums;
using FluentAssertions;

namespace CapitalLab.Tests.Unit.Domain.Business;

public sealed class PurchaseOrderTests
{
    private static PurchaseOrder NewPo() =>
        PurchaseOrder.Create("PO-20260610-000001", Guid.NewGuid(), "Acme Supplies", "SAR", null);

    [Fact]
    public void Create_RequiresSupplier()
    {
        var act = () => PurchaseOrder.Create("PO-1", Guid.NewGuid(), "  ", "SAR", null);
        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void AddItem_RecalculatesTotal()
    {
        var po = NewPo();
        po.AddItem(Guid.NewGuid(), 10, 5m);
        po.AddItem(Guid.NewGuid(), 4, 25m);
        po.TotalAmount.Should().Be(150m); // 50 + 100
    }

    [Fact]
    public void Submit_WithNoItems_Throws()
    {
        var po = NewPo();
        var act = () => po.Submit();
        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void FullWorkflow_DraftToReceived()
    {
        var po = NewPo();
        po.AddItem(Guid.NewGuid(), 10, 5m);
        po.Submit();
        po.Status.Should().Be(PurchaseOrderStatus.Submitted);
        po.OrderedAt.Should().NotBeNull();

        po.Approve();
        po.Status.Should().Be(PurchaseOrderStatus.Approved);

        po.Receive();
        po.Status.Should().Be(PurchaseOrderStatus.Received);
        po.ReceivedAt.Should().NotBeNull();
    }

    [Fact]
    public void Approve_FromDraft_Throws()
    {
        var po = NewPo();
        po.AddItem(Guid.NewGuid(), 1, 1m);
        var act = () => po.Approve();
        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Cancel_ReceivedOrder_Throws()
    {
        var po = NewPo();
        po.AddItem(Guid.NewGuid(), 1, 1m);
        po.Submit();
        po.Approve();
        po.Receive();
        var act = () => po.Cancel();
        act.Should().Throw<InvalidOperationException>();
    }
}
