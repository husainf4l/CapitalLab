using CapitalLab.Contracts.Enums;

namespace CapitalLab.Contracts.Billing;

// ── Requests ──────────────────────────────────────────────────────────────────
public record CreateInvoiceItemRequest(
    string Description,
    InvoiceItemType ItemType,
    Guid? ReferenceId,
    decimal Quantity,
    decimal UnitPrice,
    decimal DiscountAmount);

public record CreateInvoiceRequest(
    Guid PatientId,
    Guid BranchId,
    Guid? TestOrderId,
    string Currency,
    decimal TaxAmount,
    decimal DiscountAmount,
    DateTime? DueAt,
    string? Notes,
    List<CreateInvoiceItemRequest> Items);

public record CancelInvoiceRequest(string? Reason);

// ── Responses ─────────────────────────────────────────────────────────────────
public record InvoiceItemResponse(
    Guid Id,
    string Description,
    InvoiceItemType ItemType,
    Guid? ReferenceId,
    decimal Quantity,
    decimal UnitPrice,
    decimal DiscountAmount,
    decimal TotalPrice);

public record InvoiceResponse(
    Guid Id,
    string InvoiceNumber,
    Guid PatientId,
    Guid? TestOrderId,
    Guid BranchId,
    decimal SubtotalAmount,
    decimal DiscountAmount,
    decimal TaxAmount,
    decimal TotalAmount,
    decimal PaidAmount,
    decimal BalanceAmount,
    string Currency,
    InvoiceStatus Status,
    DateTime? IssuedAt,
    DateTime? DueAt,
    string? Notes,
    List<InvoiceItemResponse> Items,
    DateTime CreatedAt);

public record InvoiceSummaryResponse(
    Guid Id,
    string InvoiceNumber,
    Guid PatientId,
    decimal TotalAmount,
    decimal PaidAmount,
    decimal BalanceAmount,
    string Currency,
    InvoiceStatus Status,
    DateTime? IssuedAt,
    DateTime CreatedAt);
