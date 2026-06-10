using CapitalLab.Contracts.Billing;
using CapitalLab.Domain.Entities.Billing;
using ContractEnums = CapitalLab.Contracts.Enums;

namespace CapitalLab.Application.Features.Billing;

internal static class BillingMapping
{
    public static InvoiceResponse ToResponse(this Invoice i) => new(
        i.Id, i.InvoiceNumber, i.PatientId, i.TestOrderId, i.BranchId,
        i.SubtotalAmount, i.DiscountAmount, i.TaxAmount, i.TotalAmount, i.PaidAmount, i.BalanceAmount,
        i.Currency, (ContractEnums.InvoiceStatus)i.Status, i.IssuedAt, i.DueAt, i.Notes,
        i.Items.Select(x => new InvoiceItemResponse(
            x.Id, x.Description, (ContractEnums.InvoiceItemType)x.ItemType, x.ReferenceId,
            x.Quantity, x.UnitPrice, x.DiscountAmount, x.TotalPrice)).ToList(),
        i.CreatedAt);

    public static InvoiceSummaryResponse ToSummary(this Invoice i) => new(
        i.Id, i.InvoiceNumber, i.PatientId, i.TotalAmount, i.PaidAmount, i.BalanceAmount,
        i.Currency, (ContractEnums.InvoiceStatus)i.Status, i.IssuedAt, i.CreatedAt);

    public static PaymentResponse ToResponse(this Payment p) => new(
        p.Id, p.InvoiceId, p.PatientId, p.BranchId, p.Amount, p.Currency,
        (ContractEnums.PaymentMethod)p.Method, (ContractEnums.PaymentStatus)p.Status,
        p.TransactionReference, p.PaidAt, p.Notes, p.CreatedAt);
}
