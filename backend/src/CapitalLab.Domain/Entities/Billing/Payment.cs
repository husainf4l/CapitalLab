using CapitalLab.Domain.Common;
using CapitalLab.Domain.Enums;

namespace CapitalLab.Domain.Entities.Billing;

public class Payment : AggregateRoot
{
    public Guid InvoiceId { get; private set; }
    public Guid PatientId { get; private set; }
    public Guid BranchId { get; private set; }
    public decimal Amount { get; private set; }
    public string Currency { get; private set; } = "SAR";
    public PaymentMethod Method { get; private set; }
    public PaymentStatus Status { get; private set; } = PaymentStatus.Pending;
    public string? TransactionReference { get; private set; }
    public DateTime? PaidAt { get; private set; }
    public string? Notes { get; private set; }

    private Payment() { }

    public static Payment Record(
        Guid invoiceId,
        Guid patientId,
        Guid branchId,
        decimal amount,
        string currency,
        PaymentMethod method,
        string? transactionReference,
        string? notes)
    {
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount), "Payment amount must be positive.");

        return new Payment
        {
            Id = Guid.NewGuid(),
            InvoiceId = invoiceId,
            PatientId = patientId,
            BranchId = branchId,
            Amount = Math.Round(amount, 3),
            Currency = currency.Trim().ToUpperInvariant(),
            Method = method,
            Status = PaymentStatus.Completed,
            TransactionReference = transactionReference?.Trim(),
            PaidAt = DateTime.UtcNow,
            Notes = notes?.Trim()
        };
    }

    public void Refund()
    {
        if (Status != PaymentStatus.Completed)
            throw new InvalidOperationException("Only a completed payment can be refunded.");
        Status = PaymentStatus.Refunded;
    }

    public void Cancel()
    {
        if (Status == PaymentStatus.Completed)
            throw new InvalidOperationException("Cannot cancel a completed payment; refund it instead.");
        Status = PaymentStatus.Cancelled;
    }
}
