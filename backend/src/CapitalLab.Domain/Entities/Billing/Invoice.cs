using CapitalLab.Domain.Common;
using CapitalLab.Domain.Enums;

namespace CapitalLab.Domain.Entities.Billing;

public class Invoice : AggregateRoot
{
    public string InvoiceNumber { get; private set; } = string.Empty;
    public Guid PatientId { get; private set; }
    public Guid? TestOrderId { get; private set; }
    public Guid BranchId { get; private set; }
    public decimal SubtotalAmount { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public decimal TaxAmount { get; private set; }
    public decimal TotalAmount { get; private set; }
    public decimal PaidAmount { get; private set; }
    public decimal BalanceAmount { get; private set; }
    public string Currency { get; private set; } = "SAR";
    public InvoiceStatus Status { get; private set; } = InvoiceStatus.Draft;
    public DateTime? IssuedAt { get; private set; }
    public DateTime? DueAt { get; private set; }
    public string? Notes { get; private set; }

    public ICollection<InvoiceItem> Items { get; private set; } = [];

    private Invoice() { }

    public static Invoice Create(
        string invoiceNumber,
        Guid patientId,
        Guid? testOrderId,
        Guid branchId,
        string currency,
        decimal taxAmount,
        DateTime? dueAt,
        string? notes)
    {
        if (taxAmount < 0) throw new ArgumentOutOfRangeException(nameof(taxAmount));

        return new Invoice
        {
            Id = Guid.NewGuid(),
            InvoiceNumber = invoiceNumber,
            PatientId = patientId,
            TestOrderId = testOrderId,
            BranchId = branchId,
            Currency = currency.Trim().ToUpperInvariant(),
            TaxAmount = Math.Round(taxAmount, 3),
            DueAt = dueAt,
            Notes = notes?.Trim(),
            Status = InvoiceStatus.Draft
        };
    }

    public InvoiceItem AddItem(
        string description,
        InvoiceItemType itemType,
        Guid? referenceId,
        decimal quantity,
        decimal unitPrice,
        decimal discountAmount)
    {
        EnsureStatus(InvoiceStatus.Draft);
        var item = InvoiceItem.Create(Id, description, itemType, referenceId, quantity, unitPrice, discountAmount);
        Items.Add(item);
        Recalculate();
        return item;
    }

    /// <summary>Applies an invoice-level discount on top of line discounts.</summary>
    public void ApplyDiscount(decimal discountAmount)
    {
        EnsureStatus(InvoiceStatus.Draft, InvoiceStatus.Issued);
        if (discountAmount < 0) throw new ArgumentOutOfRangeException(nameof(discountAmount));
        DiscountAmount = Math.Round(discountAmount, 3);
        Recalculate();
    }

    private void Recalculate()
    {
        SubtotalAmount = Math.Round(Items.Sum(i => i.TotalPrice), 3);
        var total = SubtotalAmount - DiscountAmount + TaxAmount;
        if (total < 0) total = 0;
        TotalAmount = Math.Round(total, 3);
        BalanceAmount = Math.Round(TotalAmount - PaidAmount, 3);
    }

    public void Issue()
    {
        EnsureStatus(InvoiceStatus.Draft);
        if (Items.Count == 0)
            throw new InvalidOperationException("Cannot issue an invoice with no items.");
        Status = InvoiceStatus.Issued;
        IssuedAt = DateTime.UtcNow;
        Recalculate();
    }

    /// <summary>Registers a payment against the invoice. Payment cannot exceed the outstanding balance.</summary>
    public void RegisterPayment(decimal amount)
    {
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount), "Payment amount must be positive.");
        if (Status is InvoiceStatus.Cancelled or InvoiceStatus.Refunded)
            throw new InvalidOperationException("Cannot pay a cancelled or refunded invoice.");
        if (amount > BalanceAmount + 0.0001m)
            throw new InvalidOperationException("Payment amount exceeds the invoice balance.");

        PaidAmount = Math.Round(PaidAmount + amount, 3);
        BalanceAmount = Math.Round(TotalAmount - PaidAmount, 3);
        Status = BalanceAmount <= 0.0001m ? InvoiceStatus.Paid : InvoiceStatus.PartiallyPaid;
    }

    /// <summary>Reverses a payment amount (used on payment refund).</summary>
    public void ReversePayment(decimal amount)
    {
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount));
        PaidAmount = Math.Round(Math.Max(0, PaidAmount - amount), 3);
        BalanceAmount = Math.Round(TotalAmount - PaidAmount, 3);
        if (Status != InvoiceStatus.Cancelled)
            Status = PaidAmount <= 0.0001m ? InvoiceStatus.Issued : InvoiceStatus.PartiallyPaid;
    }

    public void MarkOverdue()
    {
        if (Status is InvoiceStatus.Issued or InvoiceStatus.PartiallyPaid)
            Status = InvoiceStatus.Overdue;
    }

    public void Cancel()
    {
        if (Status is InvoiceStatus.Paid or InvoiceStatus.Refunded)
            throw new InvalidOperationException("Cannot cancel a paid or refunded invoice.");
        Status = InvoiceStatus.Cancelled;
    }

    public void Refund()
    {
        if (Status != InvoiceStatus.Paid && Status != InvoiceStatus.PartiallyPaid)
            throw new InvalidOperationException("Only a paid or partially-paid invoice can be refunded.");
        Status = InvoiceStatus.Refunded;
    }

    private void EnsureStatus(params InvoiceStatus[] allowed)
    {
        if (Array.IndexOf(allowed, Status) < 0)
            throw new InvalidOperationException(
                $"Invoice in status '{Status}' cannot perform this action; expected one of: {string.Join(", ", allowed)}.");
    }
}
