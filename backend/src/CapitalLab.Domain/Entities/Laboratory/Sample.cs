using CapitalLab.Domain.Common;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Events;

namespace CapitalLab.Domain.Entities.Laboratory;

public class Sample : AggregateRoot
{
    public string SampleNumber { get; private set; } = string.Empty;
    public Guid TestOrderId { get; private set; }
    public Guid PatientId { get; private set; }
    public Guid BranchId { get; private set; }
    public Guid? CollectedByStaffId { get; private set; }
    public SampleType SampleType { get; private set; }
    public string? Barcode { get; private set; }
    public string? BarcodeImagePath { get; private set; }
    public string? QRCode { get; private set; }
    public string? QRCodeImagePath { get; private set; }
    public DateTime? CollectionDateTime { get; private set; }
    public DateTime? ReceivedDateTime { get; private set; }
    public DateTime? ProcessingStartedAt { get; private set; }
    public DateTime? ProcessingCompletedAt { get; private set; }
    public SampleStatus Status { get; private set; } = SampleStatus.Registered;
    public string? Notes { get; private set; }
    public string? RejectionReason { get; private set; }

    public ICollection<SampleItem> Items { get; private set; } = [];

    private Sample() { }

    public static Sample Register(
        string sampleNumber,
        Guid testOrderId,
        Guid patientId,
        Guid branchId,
        SampleType sampleType,
        string? notes)
    {
        return new Sample
        {
            Id = Guid.NewGuid(),
            SampleNumber = sampleNumber,
            TestOrderId = testOrderId,
            PatientId = patientId,
            BranchId = branchId,
            SampleType = sampleType,
            Status = SampleStatus.Registered,
            Notes = notes?.Trim()
        };
    }

    public SampleItem AddItem(Guid testOrderItemId, Guid labTestId)
    {
        var item = SampleItem.Create(Id, testOrderItemId, labTestId);
        Items.Add(item);
        return item;
    }

    public void SetBarcode(string barcode, string? imagePath)
    {
        Barcode = barcode;
        BarcodeImagePath = imagePath;
    }

    public void SetQRCode(string qrCode, string? imagePath)
    {
        QRCode = qrCode;
        QRCodeImagePath = imagePath;
    }

    public void Collect(Guid? collectedByStaffId, DateTime collectionDateTime)
    {
        EnsureStatus(SampleStatus.Registered);
        Status = SampleStatus.Collected;
        CollectedByStaffId = collectedByStaffId;
        CollectionDateTime = collectionDateTime;
        RaiseDomainEvent(new SampleCollectedEvent(Id, TestOrderId, PatientId, collectedByStaffId));
    }

    public void Receive(DateTime receivedDateTime)
    {
        EnsureStatus(SampleStatus.Collected, SampleStatus.InTransit);
        Status = SampleStatus.Received;
        ReceivedDateTime = receivedDateTime;
        RaiseDomainEvent(new SampleReceivedEvent(Id, PatientId));
    }

    public void StartProcessing(DateTime startedAt)
    {
        EnsureStatus(SampleStatus.Received);
        Status = SampleStatus.Processing;
        ProcessingStartedAt = startedAt;
        RaiseDomainEvent(new SampleProcessingStartedEvent(Id, PatientId));
    }

    public void CompleteProcessing(DateTime completedAt)
    {
        EnsureStatus(SampleStatus.Processing);
        Status = SampleStatus.QualityControl;
        ProcessingCompletedAt = completedAt;
    }

    /// <summary>Applies the outcome of a quality-control check. Failed/Recollect transitions to Rejected.</summary>
    public void ApplyQualityControl(QualityControlResult result, string? reason)
    {
        EnsureStatus(SampleStatus.QualityControl, SampleStatus.Processing);
        if (result is QualityControlResult.Failed or QualityControlResult.RecollectRequired)
        {
            Status = SampleStatus.Rejected;
            RejectionReason = reason?.Trim();
        }
        else
        {
            Status = SampleStatus.QualityControl;
        }
    }

    public void Complete()
    {
        EnsureStatus(SampleStatus.QualityControl);
        Status = SampleStatus.Completed;
        foreach (var item in Items)
            item.MarkCompleted();
        RaiseDomainEvent(new SampleCompletedEvent(Id, TestOrderId, PatientId));
    }

    public void Reject(string? reason)
    {
        if (Status == SampleStatus.Completed)
            throw new InvalidOperationException("Cannot reject a completed sample.");
        Status = SampleStatus.Rejected;
        RejectionReason = reason?.Trim();
    }

    private void EnsureStatus(params SampleStatus[] allowed)
    {
        if (Array.IndexOf(allowed, Status) < 0)
            throw new InvalidOperationException(
                $"Sample in status '{Status}' cannot transition; expected one of: {string.Join(", ", allowed)}.");
    }
}
