using CapitalLab.Contracts.Enums;

namespace CapitalLab.Contracts.Billing;

public record RecordPaymentRequest(
    Guid InvoiceId,
    decimal Amount,
    PaymentMethod Method,
    string? TransactionReference,
    string? Notes);

public record PaymentResponse(
    Guid Id,
    Guid InvoiceId,
    Guid PatientId,
    Guid BranchId,
    decimal Amount,
    string Currency,
    PaymentMethod Method,
    PaymentStatus Status,
    string? TransactionReference,
    DateTime? PaidAt,
    string? Notes,
    DateTime CreatedAt);
