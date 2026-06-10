using CapitalLab.Domain.Common;

namespace CapitalLab.Domain.Entities.Laboratory;

public class TestResultHistory : BaseEntity
{
    public Guid TestResultId { get; private set; }
    public string? OldValue { get; private set; }
    public string? NewValue { get; private set; }
    public Guid? ChangedBy { get; private set; }
    public DateTime ChangedAt { get; private set; }

    public TestResult TestResult { get; private set; } = null!;

    private TestResultHistory() { }

    public static TestResultHistory Create(
        Guid testResultId,
        string? oldValue,
        string? newValue,
        Guid? changedBy,
        DateTime changedAt)
    {
        return new TestResultHistory
        {
            Id = Guid.NewGuid(),
            TestResultId = testResultId,
            OldValue = oldValue,
            NewValue = newValue,
            ChangedBy = changedBy,
            ChangedAt = changedAt
        };
    }
}
