using CapitalLab.Domain.Common;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Events;

namespace CapitalLab.Domain.Entities.Laboratory;

public class Report : AggregateRoot
{
    public string ReportNumber { get; private set; } = string.Empty;
    public Guid PatientId { get; private set; }
    public Guid SampleId { get; private set; }
    public Guid TestOrderId { get; private set; }
    public Guid? DoctorId { get; private set; }
    public DateTime GeneratedAt { get; private set; }
    public DateTime? ReleasedAt { get; private set; }
    public string? PDFPath { get; private set; }
    public string? QRCode { get; private set; }
    public ReportStatus Status { get; private set; } = ReportStatus.Generated;

    public ICollection<ReportItem> Items { get; private set; } = [];

    private Report() { }

    public static Report Generate(
        string reportNumber,
        Guid patientId,
        Guid sampleId,
        Guid testOrderId,
        Guid? doctorId,
        DateTime generatedAt,
        string? qrCode)
    {
        var report = new Report
        {
            Id = Guid.NewGuid(),
            ReportNumber = reportNumber,
            PatientId = patientId,
            SampleId = sampleId,
            TestOrderId = testOrderId,
            DoctorId = doctorId,
            GeneratedAt = generatedAt,
            QRCode = qrCode,
            Status = ReportStatus.Generated
        };

        report.RaiseDomainEvent(new ReportGeneratedEvent(report.Id, sampleId, patientId));
        return report;
    }

    public ReportItem AddItem(
        Guid labTestId,
        string testName,
        string? resultValue,
        string? unit,
        string? referenceRange,
        string? interpretation)
    {
        var item = ReportItem.Create(Id, labTestId, testName, resultValue, unit, referenceRange, interpretation);
        Items.Add(item);
        return item;
    }

    public void SetPdfPath(string pdfPath) => PDFPath = pdfPath;

    public void Release(DateTime releasedAt)
    {
        if (Status == ReportStatus.Released) return;
        if (Status is not (ReportStatus.Generated or ReportStatus.Approved))
            throw new InvalidOperationException($"Report in status '{Status}' cannot be released.");
        Status = ReportStatus.Released;
        ReleasedAt = releasedAt;
        RaiseDomainEvent(new ReportReleasedEvent(Id, PatientId, DoctorId));
    }
}
