using CapitalLab.Domain.Common;
using CapitalLab.Domain.Enums;

namespace CapitalLab.Domain.Entities.Operations;

public class AppointmentStatusHistory : BaseEntity
{
    public Guid AppointmentId { get; private set; }
    public AppointmentStatus OldStatus { get; private set; }
    public AppointmentStatus NewStatus { get; private set; }
    public Guid? ChangedBy { get; private set; }
    public DateTime ChangedAt { get; private set; }
    public string? Reason { get; private set; }

    public Appointment Appointment { get; private set; } = null!;

    private AppointmentStatusHistory() { }

    public static AppointmentStatusHistory Create(
        Guid appointmentId,
        AppointmentStatus oldStatus,
        AppointmentStatus newStatus,
        Guid? changedBy,
        string? reason) =>
        new()
        {
            Id = Guid.NewGuid(),
            AppointmentId = appointmentId,
            OldStatus = oldStatus,
            NewStatus = newStatus,
            ChangedBy = changedBy,
            ChangedAt = DateTime.UtcNow,
            Reason = reason?.Trim()
        };
}
