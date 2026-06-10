using CapitalLab.Contracts.Enums;

namespace CapitalLab.Contracts.HomeCollections;

public record HomeCollectionResponse(
    Guid Id,
    Guid AppointmentId,
    Guid PatientId,
    string Address,
    string? City,
    string? Area,
    decimal? Latitude,
    decimal? Longitude,
    DateOnly PreferredDate,
    TimeOnly PreferredTimeFrom,
    TimeOnly PreferredTimeTo,
    Guid? AssignedStaffId,
    HomeCollectionStatus Status,
    string? CollectionNotes,
    DateTime? AssignedAt,
    DateTime? CollectedAt);
