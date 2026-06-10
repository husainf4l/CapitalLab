using CapitalLab.Domain.Common;

namespace CapitalLab.Domain.Entities.Laboratory;

public class CriticalResultRule : AggregateRoot
{
    public Guid LabTestId { get; private set; }
    public decimal? MinCriticalValue { get; private set; }
    public decimal? MaxCriticalValue { get; private set; }
    public bool IsEnabled { get; private set; } = true;

    private CriticalResultRule() { }

    public static CriticalResultRule Create(
        Guid labTestId,
        decimal? minCriticalValue,
        decimal? maxCriticalValue,
        bool isEnabled = true)
    {
        if (minCriticalValue is null && maxCriticalValue is null)
            throw new ArgumentException("At least one critical threshold (min or max) must be provided.");
        if (minCriticalValue.HasValue && maxCriticalValue.HasValue && minCriticalValue > maxCriticalValue)
            throw new ArgumentException("MinCriticalValue cannot exceed MaxCriticalValue.");

        return new CriticalResultRule
        {
            Id = Guid.NewGuid(),
            LabTestId = labTestId,
            MinCriticalValue = minCriticalValue,
            MaxCriticalValue = maxCriticalValue,
            IsEnabled = isEnabled
        };
    }

    public void Update(decimal? minCriticalValue, decimal? maxCriticalValue, bool isEnabled)
    {
        MinCriticalValue = minCriticalValue;
        MaxCriticalValue = maxCriticalValue;
        IsEnabled = isEnabled;
    }

    /// <summary>Evaluates a numeric value against the rule. Returns the breach reason, or null if not critical.</summary>
    public string? Evaluate(decimal value)
    {
        if (!IsEnabled) return null;
        if (MinCriticalValue.HasValue && value <= MinCriticalValue.Value)
            return $"Value {value} is at or below critical-low threshold {MinCriticalValue.Value}.";
        if (MaxCriticalValue.HasValue && value >= MaxCriticalValue.Value)
            return $"Value {value} is at or above critical-high threshold {MaxCriticalValue.Value}.";
        return null;
    }

    public bool IsLowBreach(decimal value) => MinCriticalValue.HasValue && value <= MinCriticalValue.Value;
}
