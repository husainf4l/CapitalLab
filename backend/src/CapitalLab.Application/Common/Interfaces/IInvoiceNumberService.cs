namespace CapitalLab.Application.Common.Interfaces;

public interface IInvoiceNumberService
{
    Task<string> GenerateNextAsync(DateOnly invoiceDate, CancellationToken cancellationToken = default);
}
