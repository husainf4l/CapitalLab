using CapitalLab.Contracts.Insurance;
using CapitalLab.Domain.Entities.Insurance;
using ContractEnums = CapitalLab.Contracts.Enums;

namespace CapitalLab.Application.Features.Insurance;

internal static class InsuranceMapping
{
    public static InsuranceProviderResponse ToResponse(this InsuranceProvider p) => new(
        p.Id, p.Name, p.Code, p.Phone, p.Email, p.ContactPerson, p.IsActive, p.CreatedAt);

    public static InsuranceClaimResponse ToResponse(this InsuranceClaim c) => new(
        c.Id, c.ClaimNumber, c.PatientId, c.InvoiceId, c.ProviderId,
        c.ClaimAmount, c.ApprovedAmount, c.RejectedAmount,
        (ContractEnums.InsuranceClaimStatus)c.Status,
        c.SubmittedAt, c.ApprovedAt, c.RejectedAt, c.PaidAt, c.RejectionReason, c.CreatedAt);
}
