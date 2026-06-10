using CapitalLab.Contracts.Enums;

namespace CapitalLab.Contracts.HomeCollections;

public record CreateHomeCollectionRequest(
    Guid AppointmentId,
    string Address,
    string? City,
    string? Area,
    decimal? Latitude,
    decimal? Longitude,
    DateOnly PreferredDate,
    TimeOnly PreferredTimeFrom,
    TimeOnly PreferredTimeTo,
    string? CollectionNotes);

public record AssignHomeCollectionStaffRequest(Guid StaffProfileId);

public record UpdateHomeCollectionStatusRequest(HomeCollectionStatus Status);
