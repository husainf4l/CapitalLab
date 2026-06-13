using CapitalLab.Contracts.Enums;

namespace CapitalLab.Contracts.Analyzers;

public record AnalyzerResponse(
    Guid Id,
    string Name,
    string Manufacturer,
    string Model,
    string? SerialNumber,
    Guid BranchId,
    bool IsActive,
    DateTime CreatedAt);

public record AnalyzerImportResponse(
    Guid Id,
    Guid AnalyzerId,
    string AnalyzerName,
    AnalyzerImportType ImportType,
    AnalyzerImportStatus Status,
    string? FileName,
    int TotalRows,
    int ProcessedRows,
    string? ErrorMessage,
    DateTime ImportedAt);

public record AnalyzerImportResultResponse(
    Guid ImportId,
    int Total,
    int Processed,
    int Failed,
    string[] Errors);
