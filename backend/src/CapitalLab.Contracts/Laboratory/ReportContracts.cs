using CapitalLab.Contracts.Enums;

namespace CapitalLab.Contracts.Laboratory;

public record GenerateReportRequest(Guid? DoctorId);

public record ReportItemResponse(
    Guid Id,
    Guid LabTestId,
    string TestName,
    string? ResultValue,
    string? Unit,
    string? ReferenceRange,
    string? Interpretation);

public record ReportResponse(
    Guid Id,
    string ReportNumber,
    Guid PatientId,
    Guid SampleId,
    Guid TestOrderId,
    Guid? DoctorId,
    DateTime GeneratedAt,
    DateTime? ReleasedAt,
    string? PDFPath,
    string? QRCode,
    ReportStatus Status,
    List<ReportItemResponse> Items);

public record ReportSummaryResponse(
    Guid Id,
    string ReportNumber,
    Guid PatientId,
    Guid SampleId,
    ReportStatus Status,
    DateTime GeneratedAt,
    DateTime? ReleasedAt);
