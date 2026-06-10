using CapitalLab.Contracts.Enums;

namespace CapitalLab.Contracts.Appointments;

public record AppointmentItemRequest(Guid? LabTestId, Guid? HealthPackageId);

public record CreateAppointmentRequest(
    Guid PatientId,
    Guid BranchId,
    AppointmentType AppointmentType,
    DateOnly AppointmentDate,
    TimeOnly StartTime,
    TimeOnly EndTime,
    string? Notes,
    List<AppointmentItemRequest> Items,
    HomeCollectionDetailsRequest? HomeCollection);

public record HomeCollectionDetailsRequest(
    string Address,
    string? City,
    string? Area,
    decimal? Latitude,
    decimal? Longitude,
    DateOnly PreferredDate,
    TimeOnly PreferredTimeFrom,
    TimeOnly PreferredTimeTo,
    string? CollectionNotes);

public record RescheduleAppointmentRequest(DateOnly AppointmentDate, TimeOnly StartTime, TimeOnly EndTime, string? Notes);

public record CancelAppointmentRequest(string? Reason);
