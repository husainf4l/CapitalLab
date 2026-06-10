using CapitalLab.Domain.Common;
using CapitalLab.Domain.Enums;

namespace CapitalLab.Domain.Entities.Laboratory;

public class SampleItem : BaseEntity
{
    public Guid SampleId { get; private set; }
    public Guid TestOrderItemId { get; private set; }
    public Guid LabTestId { get; private set; }
    public SampleItemStatus Status { get; private set; } = SampleItemStatus.Pending;

    public Sample Sample { get; private set; } = null!;

    private SampleItem() { }

    public static SampleItem Create(Guid sampleId, Guid testOrderItemId, Guid labTestId)
    {
        return new SampleItem
        {
            Id = Guid.NewGuid(),
            SampleId = sampleId,
            TestOrderItemId = testOrderItemId,
            LabTestId = labTestId,
            Status = SampleItemStatus.Pending
        };
    }

    public void MarkProcessing() => Status = SampleItemStatus.Processing;
    public void MarkCompleted() => Status = SampleItemStatus.Completed;
    public void Reject() => Status = SampleItemStatus.Rejected;
}
