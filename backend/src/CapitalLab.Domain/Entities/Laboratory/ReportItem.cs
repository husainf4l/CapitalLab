using CapitalLab.Domain.Common;

namespace CapitalLab.Domain.Entities.Laboratory;

public class ReportItem : BaseEntity
{
    public Guid ReportId { get; private set; }
    public Guid LabTestId { get; private set; }
    public string TestName { get; private set; } = string.Empty;
    public string? ResultValue { get; private set; }
    public string? Unit { get; private set; }
    public string? ReferenceRange { get; private set; }
    public string? Interpretation { get; private set; }

    public Report Report { get; private set; } = null!;

    private ReportItem() { }

    public static ReportItem Create(
        Guid reportId,
        Guid labTestId,
        string testName,
        string? resultValue,
        string? unit,
        string? referenceRange,
        string? interpretation)
    {
        return new ReportItem
        {
            Id = Guid.NewGuid(),
            ReportId = reportId,
            LabTestId = labTestId,
            TestName = testName.Trim(),
            ResultValue = resultValue,
            Unit = unit?.Trim(),
            ReferenceRange = referenceRange?.Trim(),
            Interpretation = interpretation?.Trim()
        };
    }
}
