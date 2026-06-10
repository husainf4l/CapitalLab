using CapitalLab.Contracts.Enums;

namespace CapitalLab.Contracts.Laboratory;

public record ResultHistoryPointResponse(
    DateTime Date,
    decimal? Value,
    string? TextValue,
    string? Unit,
    string? ReferenceRange,
    ResultInterpretation? Interpretation,
    bool IsCritical);

public record PatientResultHistoryResponse(
    Guid LabTestId,
    string TestName,
    string? Unit,
    List<ResultHistoryPointResponse> Points);

public record TrendPointResponse(
    DateTime Date,
    decimal? Value,
    string? ReferenceRange,
    ResultInterpretation? Interpretation);

public record ResultTrendResponse(
    Guid PatientId,
    Guid LabTestId,
    string TestName,
    string? Unit,
    List<TrendPointResponse> Points);
