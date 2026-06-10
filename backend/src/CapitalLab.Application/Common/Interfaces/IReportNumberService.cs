namespace CapitalLab.Application.Common.Interfaces;

public interface IReportNumberService
{
    Task<string> GenerateNextAsync(DateOnly reportDate, CancellationToken cancellationToken = default);
}
