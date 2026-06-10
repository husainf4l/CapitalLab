namespace CapitalLab.Application.Common.Interfaces;

public interface IOrderNumberService
{
    Task<string> GenerateNextAsync(DateOnly orderDate, CancellationToken cancellationToken = default);
}
