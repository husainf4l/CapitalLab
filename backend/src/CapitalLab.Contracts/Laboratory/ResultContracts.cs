using CapitalLab.Contracts.Enums;

namespace CapitalLab.Contracts.Laboratory;

// ── Requests ─────────────────────────────────────────────────────────────────
public record CreateResultRequest(
    Guid SampleId,
    Guid PatientId,
    Guid LabTestId,
    ResultType ResultType,
    decimal? ResultValue,
    string? ResultText,
    string? Unit,
    string? ReferenceRange,
    ResultInterpretation? Interpretation);

public record UpdateResultRequest(
    decimal? ResultValue,
    string? ResultText,
    string? Unit,
    string? ReferenceRange,
    ResultInterpretation? Interpretation);

// ── Responses ────────────────────────────────────────────────────────────────
public record ResultResponse(
    Guid Id,
    Guid SampleId,
    Guid PatientId,
    Guid LabTestId,
    ResultType ResultType,
    decimal? ResultValue,
    string? ResultText,
    string? Unit,
    string? ReferenceRange,
    ResultInterpretation? Interpretation,
    ResultStatus Status,
    bool IsCritical,
    Guid? EnteredBy,
    DateTime EnteredAt,
    Guid? ApprovedBy,
    DateTime? ApprovedAt);

public record ResultSummaryResponse(
    Guid Id,
    Guid SampleId,
    Guid PatientId,
    Guid LabTestId,
    decimal? ResultValue,
    string? ResultText,
    string? Unit,
    ResultInterpretation? Interpretation,
    ResultStatus Status,
    bool IsCritical,
    DateTime EnteredAt);

public record ResultHistoryResponse(
    Guid Id,
    Guid TestResultId,
    string? OldValue,
    string? NewValue,
    Guid? ChangedBy,
    DateTime ChangedAt);
