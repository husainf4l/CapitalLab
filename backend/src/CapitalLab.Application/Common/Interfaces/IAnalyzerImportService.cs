using CapitalLab.Domain.Enums;

namespace CapitalLab.Application.Common.Interfaces;

public record AnalyzerImportResult(int Total, int Processed, int Failed, string[] Errors);

public interface IAnalyzerImportService
{
    Task<AnalyzerImportResult> ImportAsync(Guid analyzerId, AnalyzerImportType importType, string content, Guid? sampleId = null, string? fileName = null, CancellationToken cancellationToken = default);
}
