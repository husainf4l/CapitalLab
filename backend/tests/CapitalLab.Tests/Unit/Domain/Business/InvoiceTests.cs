using CapitalLab.Domain.Entities.Billing;
using CapitalLab.Domain.Enums;
using FluentAssertions;

namespace CapitalLab.Tests.Unit.Domain.Business;

public sealed class InvoiceTests
{
    private static Invoice NewInvoice(decimal tax = 0) =>
        Invoice.Create("INV-20260610-000001", Guid.NewGuid(), null, Guid.NewGuid(), "SAR", tax, null, null);

    [Fact]
    public void AddItem_CalculatesLineAndSubtotal()
    {
        var invoice = NewInvoice();
        invoice.AddItem("CBC", InvoiceItemType.Test, null, 2, 50m, 10m); // gross 100 - 10 = 90
        invoice.SubtotalAmount.Should().Be(90m);
        invoice.TotalAmount.Should().Be(90m);
    }

    [Fact]
    public void Totals_IncludeTaxAndDiscount()
    {
        var invoice = NewInvoice(tax: 15m);
        invoice.AddItem("Panel", InvoiceItemType.Test, null, 1, 200m, 0m);
        invoice.ApplyDiscount(20m);
        // subtotal 200 - discount 20 + tax 15 = 195
        invoice.TotalAmount.Should().Be(195m);
        invoice.BalanceAmount.Should().Be(195m);
    }

    [Fact]
    public void Issue_WithNoItems_Throws()
    {
        var invoice = NewInvoice();
        var act = () => invoice.Issue();
        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void RegisterPayment_Partial_SetsPartiallyPaid()
    {
        var invoice = NewInvoice();
        invoice.AddItem("Test", InvoiceItemType.Test, null, 1, 100m, 0m);
        invoice.Issue();
        invoice.RegisterPayment(40m);
        invoice.PaidAmount.Should().Be(40m);
        invoice.BalanceAmount.Should().Be(60m);
        invoice.Status.Should().Be(InvoiceStatus.PartiallyPaid);
    }

    [Fact]
    public void RegisterPayment_Full_SetsPaid()
    {
        var invoice = NewInvoice();
        invoice.AddItem("Test", InvoiceItemType.Test, null, 1, 100m, 0m);
        invoice.Issue();
        invoice.RegisterPayment(100m);
        invoice.Status.Should().Be(InvoiceStatus.Paid);
        invoice.BalanceAmount.Should().Be(0m);
    }

    [Fact]
    public void RegisterPayment_ExceedingBalance_Throws()
    {
        var invoice = NewInvoice();
        invoice.AddItem("Test", InvoiceItemType.Test, null, 1, 100m, 0m);
        invoice.Issue();
        var act = () => invoice.RegisterPayment(150m);
        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void ReversePayment_RestoresBalance()
    {
        var invoice = NewInvoice();
        invoice.AddItem("Test", InvoiceItemType.Test, null, 1, 100m, 0m);
        invoice.Issue();
        invoice.RegisterPayment(100m);
        invoice.ReversePayment(100m);
        invoice.PaidAmount.Should().Be(0m);
        invoice.BalanceAmount.Should().Be(100m);
        invoice.Status.Should().Be(InvoiceStatus.Issued);
    }

    [Fact]
    public void Refund_OnPaidInvoice_SetsRefunded()
    {
        var invoice = NewInvoice();
        invoice.AddItem("Test", InvoiceItemType.Test, null, 1, 100m, 0m);
        invoice.Issue();
        invoice.RegisterPayment(100m);
        invoice.Refund();
        invoice.Status.Should().Be(InvoiceStatus.Refunded);
    }

    [Fact]
    public void Cancel_PaidInvoice_Throws()
    {
        var invoice = NewInvoice();
        invoice.AddItem("Test", InvoiceItemType.Test, null, 1, 100m, 0m);
        invoice.Issue();
        invoice.RegisterPayment(100m);
        var act = () => invoice.Cancel();
        act.Should().Throw<InvalidOperationException>();
    }
}
