namespace CapitalLab.Application.Common.Interfaces;

public interface IPdfReportService
{
    Task<byte[]> GenerateReportAsync(Guid reportId, CancellationToken cancellationToken = default);
    Task<string> GenerateAndStoreReportAsync(Guid reportId, CancellationToken cancellationToken = default);
}
