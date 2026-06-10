using CapitalLab.Domain.Common;
using CapitalLab.Domain.Enums;

namespace CapitalLab.Domain.Entities.Laboratory;

public class QualityControlRecord : BaseEntity
{
    public Guid SampleId { get; private set; }
    public Guid? CheckedBy { get; private set; }
    public DateTime CheckedAt { get; private set; }
    public QualityControlResult Result { get; private set; }
    public string? Notes { get; private set; }

    public Sample Sample { get; private set; } = null!;

    private QualityControlRecord() { }

    public static QualityControlRecord Create(
        Guid sampleId,
        Guid? checkedBy,
        DateTime checkedAt,
        QualityControlResult result,
        string? notes)
    {
        return new QualityControlRecord
        {
            Id = Guid.NewGuid(),
            SampleId = sampleId,
            CheckedBy = checkedBy,
            CheckedAt = checkedAt,
            Result = result,
            Notes = notes?.Trim()
        };
    }
}
