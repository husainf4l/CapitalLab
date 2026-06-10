namespace CapitalLab.Application.Common.Interfaces;

public interface ISampleNumberService
{
    Task<string> GenerateNextAsync(DateOnly collectionDate, CancellationToken cancellationToken = default);
}
