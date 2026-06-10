using CapitalLab.Domain.Common;
using CapitalLab.Domain.Entities.Organization;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Events;

namespace CapitalLab.Domain.Entities.Operations;

public class Appointment : AggregateRoot
{
    public string AppointmentNumber { get; private set; } = string.Empty;
    public Guid PatientId { get; private set; }
    public Guid BranchId { get; private set; }
    public AppointmentType AppointmentType { get; private set; }
    public DateOnly AppointmentDate { get; private set; }
    public TimeOnly StartTime { get; private set; }
    public TimeOnly EndTime { get; private set; }
    public AppointmentStatus Status { get; private set; } = AppointmentStatus.Pending;
    public string? Notes { get; private set; }
    public string? CancellationReason { get; private set; }
    public DateTime? ConfirmedAt { get; private set; }
    public DateTime? CancelledAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }

    public Patient Patient { get; private set; } = null!;
    public Branch Branch { get; private set; } = null!;
    public ICollection<AppointmentItem> Items { get; private set; } = [];
    public ICollection<AppointmentStatusHistory> StatusHistory { get; private set; } = [];
    public HomeCollectionRequest? HomeCollectionRequest { get; private set; }
    public TestOrder? TestOrder { get; private set; }

    private Appointment() { }

    public static Appointment Create(
        string appointmentNumber,
        Guid patientId,
        Guid branchId,
        AppointmentType appointmentType,
        DateOnly appointmentDate,
        TimeOnly startTime,
        TimeOnly endTime,
        string? notes)
    {
        if (startTime >= endTime)
            throw new ArgumentException("Start time must be before end time.");

        var appointment = new Appointment
        {
            Id = Guid.NewGuid(),
            AppointmentNumber = appointmentNumber,
            PatientId = patientId,
            BranchId = branchId,
            AppointmentType = appointmentType,
            AppointmentDate = appointmentDate,
            StartTime = startTime,
            EndTime = endTime,
            Status = AppointmentStatus.Pending,
            Notes = notes?.Trim()
        };

        appointment.RaiseDomainEvent(new AppointmentCreatedEvent(appointment.Id, patientId));
        return appointment;
    }

    public void Reschedule(DateOnly appointmentDate, TimeOnly startTime, TimeOnly endTime, string? notes)
    {
        if (Status is AppointmentStatus.Completed or AppointmentStatus.Cancelled)
            throw new InvalidOperationException("Cannot reschedule a completed or cancelled appointment.");
        if (startTime >= endTime)
            throw new ArgumentException("Start time must be before end time.");

        AppointmentDate = appointmentDate;
        StartTime = startTime;
        EndTime = endTime;
        Notes = notes?.Trim();
    }

    public AppointmentStatusHistory Confirm(Guid? changedBy, string? reason = null)
    {
        if (Status == AppointmentStatus.Completed)
            throw new InvalidOperationException("Cannot confirm a completed appointment.");
        if (Status == AppointmentStatus.Cancelled)
            throw new InvalidOperationException("Cannot confirm a cancelled appointment.");

        var history = ChangeStatus(AppointmentStatus.Confirmed, changedBy, reason);
        ConfirmedAt = DateTime.UtcNow;
        RaiseDomainEvent(new AppointmentConfirmedEvent(Id, PatientId));
        return history;
    }

    public AppointmentStatusHistory MarkInProgress(Guid? changedBy)
    {
        if (Status == AppointmentStatus.Cancelled)
            throw new InvalidOperationException("Cannot start a cancelled appointment.");
        if (Status == AppointmentStatus.Completed)
            throw new InvalidOperationException("Cannot start a completed appointment.");

        return ChangeStatus(AppointmentStatus.InProgress, changedBy, null);
    }

    public AppointmentStatusHistory Complete(Guid? changedBy)
    {
        if (Status == AppointmentStatus.Cancelled)
            throw new InvalidOperationException("Cannot complete a cancelled appointment.");

        var history = ChangeStatus(AppointmentStatus.Completed, changedBy, null);
        CompletedAt = DateTime.UtcNow;
        RaiseDomainEvent(new AppointmentCompletedEvent(Id, PatientId));
        return history;
    }

    public AppointmentStatusHistory Cancel(Guid? changedBy, string? reason)
    {
        if (Status == AppointmentStatus.Completed)
            throw new InvalidOperationException("Cannot cancel a completed appointment.");

        CancellationReason = reason?.Trim();
        CancelledAt = DateTime.UtcNow;
        var history = ChangeStatus(AppointmentStatus.Cancelled, changedBy, reason);
        RaiseDomainEvent(new AppointmentCancelledEvent(Id, PatientId, CancellationReason));
        return history;
    }

    private AppointmentStatusHistory ChangeStatus(AppointmentStatus newStatus, Guid? changedBy, string? reason)
    {
        var oldStatus = Status;
        Status = newStatus;
        return AppointmentStatusHistory.Create(Id, oldStatus, newStatus, changedBy, reason);
    }
}
