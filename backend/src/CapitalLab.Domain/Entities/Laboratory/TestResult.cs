using CapitalLab.Domain.Common;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Events;

namespace CapitalLab.Domain.Entities.Laboratory;

public class TestResult : AggregateRoot
{
    public Guid SampleId { get; private set; }
    public Guid PatientId { get; private set; }
    public Guid LabTestId { get; private set; }
    public ResultType ResultType { get; private set; }
    public decimal? ResultValue { get; private set; }
    public string? ResultText { get; private set; }
    public string? Unit { get; private set; }
    public string? ReferenceRange { get; private set; }
    public ResultInterpretation? Interpretation { get; private set; }
    public ResultStatus Status { get; private set; } = ResultStatus.Draft;
    public Guid? EnteredBy { get; private set; }
    public DateTime EnteredAt { get; private set; }
    public Guid? ApprovedBy { get; private set; }
    public DateTime? ApprovedAt { get; private set; }
    public bool IsCritical { get; private set; }

    public Sample Sample { get; private set; } = null!;

    private TestResult() { }

    public static TestResult Create(
        Guid sampleId,
        Guid patientId,
        Guid labTestId,
        ResultType resultType,
        decimal? resultValue,
        string? resultText,
        string? unit,
        string? referenceRange,
        ResultInterpretation? interpretation,
        Guid? enteredBy,
        DateTime enteredAt)
    {
        var result = new TestResult
        {
            Id = Guid.NewGuid(),
            SampleId = sampleId,
            PatientId = patientId,
            LabTestId = labTestId,
            ResultType = resultType,
            ResultValue = resultValue,
            ResultText = resultText?.Trim(),
            Unit = unit?.Trim(),
            ReferenceRange = referenceRange?.Trim(),
            Interpretation = interpretation,
            Status = ResultStatus.Draft,
            EnteredBy = enteredBy,
            EnteredAt = enteredAt
        };

        result.RaiseDomainEvent(new ResultEnteredEvent(result.Id, sampleId, patientId, labTestId));
        return result;
    }

    /// <summary>Updates the captured value. Only permitted before approval. Returns the previous value snapshot.</summary>
    public (string? OldValue, string? NewValue) UpdateValue(
        decimal? resultValue,
        string? resultText,
        string? unit,
        string? referenceRange,
        ResultInterpretation? interpretation)
    {
        if (Status is ResultStatus.Approved or ResultStatus.Released)
            throw new InvalidOperationException("Cannot modify an approved or released result. Amend it instead.");

        var oldValue = ResultValue?.ToString() ?? ResultText;

        ResultValue = resultValue;
        ResultText = resultText?.Trim();
        Unit = unit?.Trim();
        ReferenceRange = referenceRange?.Trim();
        Interpretation = interpretation;

        var newValue = ResultValue?.ToString() ?? ResultText;
        return (oldValue, newValue);
    }

    public void FlagCritical(ResultInterpretation interpretation)
    {
        IsCritical = true;
        Interpretation = interpretation;
    }

    /// <summary>Flags the result as critical and raises the detection event linking the generated alert.</summary>
    public void MarkCriticalDetected(Guid alertId, string triggerReason, ResultInterpretation interpretation)
    {
        IsCritical = true;
        Interpretation = interpretation;
        RaiseDomainEvent(new CriticalResultDetectedEvent(Id, alertId, PatientId, LabTestId, triggerReason));
    }

    public void SubmitForReview()
    {
        EnsureStatus(ResultStatus.Draft, ResultStatus.Amended);
        Status = ResultStatus.PendingReview;
    }

    public void Approve(Guid? approvedBy, DateTime approvedAt)
    {
        EnsureStatus(ResultStatus.PendingReview, ResultStatus.DoctorReview);
        Status = ResultStatus.Approved;
        ApprovedBy = approvedBy;
        ApprovedAt = approvedAt;
        RaiseDomainEvent(new ResultApprovedEvent(Id, SampleId, PatientId, approvedBy));
    }

    public void Release()
    {
        EnsureStatus(ResultStatus.Approved);
        Status = ResultStatus.Released;
    }

    private void EnsureStatus(params ResultStatus[] allowed)
    {
        if (Array.IndexOf(allowed, Status) < 0)
            throw new InvalidOperationException(
                $"Result in status '{Status}' cannot transition; expected one of: {string.Join(", ", allowed)}.");
    }
}
