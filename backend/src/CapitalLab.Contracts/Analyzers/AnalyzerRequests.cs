using CapitalLab.Contracts.Enums;

namespace CapitalLab.Contracts.Analyzers;

public record CreateAnalyzerRequest(
    string Name,
    string Manufacturer,
    string Model,
    Guid BranchId,
    string? SerialNumber = null);

public record ImportAnalyzerDataRequest(
    Guid AnalyzerId,
    AnalyzerImportType ImportType,
    string Content,
    string? FileName = null,
    Guid? SampleId = null);
