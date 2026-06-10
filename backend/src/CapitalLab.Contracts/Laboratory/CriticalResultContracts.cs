namespace CapitalLab.Contracts.Laboratory;

// ── Critical result rules ──────────────────────────────────────────────────────
public record CreateCriticalResultRuleRequest(
    Guid LabTestId,
    decimal? MinCriticalValue,
    decimal? MaxCriticalValue,
    bool IsEnabled);

public record UpdateCriticalResultRuleRequest(
    decimal? MinCriticalValue,
    decimal? MaxCriticalValue,
    bool IsEnabled);

public record CriticalResultRuleResponse(
    Guid Id,
    Guid LabTestId,
    decimal? MinCriticalValue,
    decimal? MaxCriticalValue,
    bool IsEnabled);

// ── Critical result alerts ──────────────────────────────────────────────────────
public record AcknowledgeAlertRequest(Guid? AcknowledgedBy);

public record CriticalResultAlertResponse(
    Guid Id,
    Guid TestResultId,
    Guid PatientId,
    Guid LabTestId,
    decimal? ResultValue,
    DateTime TriggeredAt,
    string TriggerReason,
    bool IsAcknowledged,
    Guid? AcknowledgedBy,
    DateTime? AcknowledgedAt);
