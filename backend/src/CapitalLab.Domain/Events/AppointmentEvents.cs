using CapitalLab.Domain.Common;
using MediatR;

namespace CapitalLab.Domain.Events;

public sealed record AppointmentCreatedEvent(Guid AppointmentId, Guid PatientId) : IDomainEvent, INotification;

public sealed record AppointmentConfirmedEvent(Guid AppointmentId, Guid PatientId) : IDomainEvent, INotification;

public sealed record AppointmentCancelledEvent(Guid AppointmentId, Guid PatientId, string? Reason) : IDomainEvent, INotification;

public sealed record AppointmentCompletedEvent(Guid AppointmentId, Guid PatientId) : IDomainEvent, INotification;
