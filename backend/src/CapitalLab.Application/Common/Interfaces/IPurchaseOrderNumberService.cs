namespace CapitalLab.Application.Common.Interfaces;

public interface IPurchaseOrderNumberService
{
    Task<string> GenerateNextAsync(DateOnly orderDate, CancellationToken cancellationToken = default);
}
