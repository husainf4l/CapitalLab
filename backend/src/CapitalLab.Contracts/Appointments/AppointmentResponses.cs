using CapitalLab.Contracts.Enums;

namespace CapitalLab.Contracts.Appointments;

public record AppointmentItemResponse(
    Guid Id,
    Guid? LabTestId,
    Guid? HealthPackageId,
    OrderItemType ItemType,
    string NameSnapshot,
    string CodeSnapshot,
    decimal PriceSnapshot,
    string CurrencySnapshot);

public record AppointmentStatusHistoryResponse(
    Guid Id,
    AppointmentStatus OldStatus,
    AppointmentStatus NewStatus,
    Guid? ChangedBy,
    DateTime ChangedAt,
    string? Reason);

public record AppointmentResponse(
    Guid Id,
    string AppointmentNumber,
    Guid PatientId,
    Guid BranchId,
    AppointmentType AppointmentType,
    DateOnly AppointmentDate,
    TimeOnly StartTime,
    TimeOnly EndTime,
    AppointmentStatus Status,
    string? Notes,
    string? CancellationReason,
    DateTime? ConfirmedAt,
    DateTime? CancelledAt,
    DateTime? CompletedAt,
    List<AppointmentItemResponse> Items,
    List<AppointmentStatusHistoryResponse> StatusHistory);

public record AppointmentSummaryResponse(
    Guid Id,
    string AppointmentNumber,
    Guid PatientId,
    Guid BranchId,
    AppointmentType AppointmentType,
    DateOnly AppointmentDate,
    TimeOnly StartTime,
    TimeOnly EndTime,
    AppointmentStatus Status,
    int ItemCount);
