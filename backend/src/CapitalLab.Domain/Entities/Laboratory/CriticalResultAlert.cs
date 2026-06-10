using CapitalLab.Domain.Common;

namespace CapitalLab.Domain.Entities.Laboratory;

public class CriticalResultAlert : BaseEntity
{
    public Guid TestResultId { get; private set; }
    public DateTime TriggeredAt { get; private set; }
    public string TriggerReason { get; private set; } = string.Empty;
    public bool IsAcknowledged { get; private set; }
    public Guid? AcknowledgedBy { get; private set; }
    public DateTime? AcknowledgedAt { get; private set; }

    public TestResult TestResult { get; private set; } = null!;

    private CriticalResultAlert() { }

    public static CriticalResultAlert Create(Guid testResultId, DateTime triggeredAt, string triggerReason)
    {
        return new CriticalResultAlert
        {
            Id = Guid.NewGuid(),
            TestResultId = testResultId,
            TriggeredAt = triggeredAt,
            TriggerReason = triggerReason,
            IsAcknowledged = false
        };
    }

    public void Acknowledge(Guid? acknowledgedBy, DateTime acknowledgedAt)
    {
        if (IsAcknowledged) return;
        IsAcknowledged = true;
        AcknowledgedBy = acknowledgedBy;
        AcknowledgedAt = acknowledgedAt;
    }
}
