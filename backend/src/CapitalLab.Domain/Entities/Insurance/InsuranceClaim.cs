using CapitalLab.Domain.Common;
using CapitalLab.Domain.Enums;

namespace CapitalLab.Domain.Entities.Insurance;

public class InsuranceClaim : AggregateRoot
{
    public string ClaimNumber { get; private set; } = string.Empty;
    public Guid PatientId { get; private set; }
    public Guid InvoiceId { get; private set; }
    public Guid ProviderId { get; private set; }
    public decimal ClaimAmount { get; private set; }
    public decimal ApprovedAmount { get; private set; }
    public decimal RejectedAmount { get; private set; }
    public InsuranceClaimStatus Status { get; private set; } = InsuranceClaimStatus.Draft;
    public DateTime? SubmittedAt { get; private set; }
    public DateTime? ApprovedAt { get; private set; }
    public DateTime? RejectedAt { get; private set; }
    public DateTime? PaidAt { get; private set; }
    public string? RejectionReason { get; private set; }

    private InsuranceClaim() { }

    public static InsuranceClaim Create(
        string claimNumber,
        Guid patientId,
        Guid invoiceId,
        Guid providerId,
        decimal claimAmount)
    {
        if (claimAmount <= 0) throw new ArgumentOutOfRangeException(nameof(claimAmount), "Claim amount must be positive.");

        return new InsuranceClaim
        {
            Id = Guid.NewGuid(),
            ClaimNumber = claimNumber,
            PatientId = patientId,
            InvoiceId = invoiceId,
            ProviderId = providerId,
            ClaimAmount = Math.Round(claimAmount, 3),
            Status = InsuranceClaimStatus.Draft
        };
    }

    public void Submit()
    {
        EnsureStatus(InsuranceClaimStatus.Draft);
        Status = InsuranceClaimStatus.Submitted;
        SubmittedAt = DateTime.UtcNow;
    }

    public void MarkUnderReview()
    {
        EnsureStatus(InsuranceClaimStatus.Submitted);
        Status = InsuranceClaimStatus.UnderReview;
    }

    public void Approve(decimal approvedAmount)
    {
        EnsureStatus(InsuranceClaimStatus.Submitted, InsuranceClaimStatus.UnderReview);
        if (approvedAmount <= 0) throw new ArgumentOutOfRangeException(nameof(approvedAmount));
        if (approvedAmount > ClaimAmount + 0.0001m)
            throw new InvalidOperationException("Approved amount cannot exceed the claim amount.");

        ApprovedAmount = Math.Round(approvedAmount, 3);
        RejectedAmount = Math.Round(ClaimAmount - ApprovedAmount, 3);
        Status = RejectedAmount > 0.0001m
            ? InsuranceClaimStatus.PartiallyApproved
            : InsuranceClaimStatus.Approved;
        ApprovedAt = DateTime.UtcNow;
    }

    public void Reject(string reason)
    {
        EnsureStatus(InsuranceClaimStatus.Submitted, InsuranceClaimStatus.UnderReview);
        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("A rejection reason is required.", nameof(reason));

        Status = InsuranceClaimStatus.Rejected;
        RejectedAmount = ClaimAmount;
        ApprovedAmount = 0m;
        RejectionReason = reason.Trim();
        RejectedAt = DateTime.UtcNow;
    }

    public void MarkPaid()
    {
        EnsureStatus(InsuranceClaimStatus.Approved, InsuranceClaimStatus.PartiallyApproved);
        Status = InsuranceClaimStatus.Paid;
        PaidAt = DateTime.UtcNow;
    }

    private void EnsureStatus(params InsuranceClaimStatus[] allowed)
    {
        if (Array.IndexOf(allowed, Status) < 0)
            throw new InvalidOperationException(
                $"Claim in status '{Status}' cannot perform this action; expected one of: {string.Join(", ", allowed)}.");
    }
}
