using CapitalLab.Contracts.Enums;

namespace CapitalLab.Contracts.Laboratory;

// ── Requests ─────────────────────────────────────────────────────────────────
public record CreateSampleItemRequest(Guid TestOrderItemId, Guid LabTestId);

public record CreateSampleRequest(
    Guid TestOrderId,
    SampleType SampleType,
    string? Notes,
    List<CreateSampleItemRequest> Items);

public record CollectSampleRequest(Guid? CollectedByStaffId, DateTime? CollectionDateTime);

public record ReceiveSampleRequest(DateTime? ReceivedDateTime);

public record QualityCheckRequest(QualityControlResult Result, string? Notes, Guid? CheckedBy);

public record RejectSampleRequest(string? Reason);

// ── Responses ────────────────────────────────────────────────────────────────
public record SampleItemResponse(
    Guid Id,
    Guid TestOrderItemId,
    Guid LabTestId,
    SampleItemStatus Status);

public record SampleResponse(
    Guid Id,
    string SampleNumber,
    Guid TestOrderId,
    Guid PatientId,
    Guid BranchId,
    Guid? CollectedByStaffId,
    SampleType SampleType,
    string? Barcode,
    string? BarcodeImagePath,
    string? QRCode,
    string? QRCodeImagePath,
    DateTime? CollectionDateTime,
    DateTime? ReceivedDateTime,
    DateTime? ProcessingStartedAt,
    DateTime? ProcessingCompletedAt,
    SampleStatus Status,
    string? Notes,
    string? RejectionReason,
    DateTime CreatedAt,
    List<SampleItemResponse> Items);

public record SampleSummaryResponse(
    Guid Id,
    string SampleNumber,
    Guid TestOrderId,
    Guid PatientId,
    SampleType SampleType,
    SampleStatus Status,
    DateTime? CollectionDateTime,
    DateTime CreatedAt);

public record QualityControlRecordResponse(
    Guid Id,
    Guid SampleId,
    Guid? CheckedBy,
    DateTime CheckedAt,
    QualityControlResult Result,
    string? Notes);
