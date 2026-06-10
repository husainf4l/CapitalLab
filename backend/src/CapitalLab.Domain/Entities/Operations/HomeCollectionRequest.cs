using CapitalLab.Domain.Common;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Events;

namespace CapitalLab.Domain.Entities.Operations;

public class HomeCollectionRequest : AggregateRoot
{
    public Guid AppointmentId { get; private set; }
    public Guid PatientId { get; private set; }
    public string Address { get; private set; } = string.Empty;
    public string? City { get; private set; }
    public string? Area { get; private set; }
    public decimal? Latitude { get; private set; }
    public decimal? Longitude { get; private set; }
    public DateOnly PreferredDate { get; private set; }
    public TimeOnly PreferredTimeFrom { get; private set; }
    public TimeOnly PreferredTimeTo { get; private set; }
    public Guid? AssignedStaffId { get; private set; }
    public HomeCollectionStatus Status { get; private set; } = HomeCollectionStatus.Requested;
    public string? CollectionNotes { get; private set; }
    public DateTime? AssignedAt { get; private set; }
    public DateTime? CollectedAt { get; private set; }

    public Appointment Appointment { get; private set; } = null!;
    public Patient Patient { get; private set; } = null!;
    public StaffProfile? AssignedStaff { get; private set; }

    private HomeCollectionRequest() { }

    public static HomeCollectionRequest Create(
        Guid appointmentId,
        Guid patientId,
        string address,
        string? city,
        string? area,
        decimal? latitude,
        decimal? longitude,
        DateOnly preferredDate,
        TimeOnly preferredTimeFrom,
        TimeOnly preferredTimeTo,
        string? collectionNotes)
    {
        if (string.IsNullOrWhiteSpace(address))
            throw new ArgumentException("Address is required.", nameof(address));
        if (preferredTimeFrom >= preferredTimeTo)
            throw new ArgumentException("Preferred time from must be before preferred time to.");

        return new HomeCollectionRequest
        {
            Id = Guid.NewGuid(),
            AppointmentId = appointmentId,
            PatientId = patientId,
            Address = address.Trim(),
            City = city?.Trim(),
            Area = area?.Trim(),
            Latitude = latitude,
            Longitude = longitude,
            PreferredDate = preferredDate,
            PreferredTimeFrom = preferredTimeFrom,
            PreferredTimeTo = preferredTimeTo,
            CollectionNotes = collectionNotes?.Trim(),
            Status = HomeCollectionStatus.Requested
        };
    }

    public void AssignStaff(Guid staffProfileId)
    {
        AssignedStaffId = staffProfileId;
        AssignedAt = DateTime.UtcNow;
        ChangeStatus(HomeCollectionStatus.Assigned);
        RaiseDomainEvent(new HomeCollectionAssignedEvent(Id, staffProfileId));
    }

    public void ChangeStatus(HomeCollectionStatus newStatus)
    {
        var oldStatus = Status;
        Status = newStatus;
        if (newStatus == HomeCollectionStatus.Collected)
            CollectedAt = DateTime.UtcNow;
        RaiseDomainEvent(new HomeCollectionStatusChangedEvent(Id, oldStatus, newStatus));
    }
}
