using CapitalLab.Contracts.Enums;

namespace CapitalLab.Contracts.Insurance;

// ── Requests ──────────────────────────────────────────────────────────────────
public record CreateInsuranceProviderRequest(
    string Name,
    string Code,
    string? Phone,
    string? Email,
    string? ContactPerson);

public record UpdateInsuranceProviderRequest(
    string Name,
    string? Phone,
    string? Email,
    string? ContactPerson,
    bool IsActive);

public record CreateClaimFromInvoiceRequest(Guid ProviderId, decimal ClaimAmount);

public record ApproveClaimRequest(decimal ApprovedAmount);

public record RejectClaimRequest(string Reason);

// ── Responses ─────────────────────────────────────────────────────────────────
public record InsuranceProviderResponse(
    Guid Id,
    string Name,
    string Code,
    string? Phone,
    string? Email,
    string? ContactPerson,
    bool IsActive,
    DateTime CreatedAt);

public record InsuranceClaimResponse(
    Guid Id,
    string ClaimNumber,
    Guid PatientId,
    Guid InvoiceId,
    Guid ProviderId,
    decimal ClaimAmount,
    decimal ApprovedAmount,
    decimal RejectedAmount,
    InsuranceClaimStatus Status,
    DateTime? SubmittedAt,
    DateTime? ApprovedAt,
    DateTime? RejectedAt,
    DateTime? PaidAt,
    string? RejectionReason,
    DateTime CreatedAt);
