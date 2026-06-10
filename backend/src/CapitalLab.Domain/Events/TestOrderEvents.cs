using CapitalLab.Domain.Common;
using MediatR;

namespace CapitalLab.Domain.Events;

public sealed record TestOrderCreatedEvent(Guid TestOrderId, Guid PatientId) : IDomainEvent, INotification;

public sealed record TestOrderCancelledEvent(Guid TestOrderId, Guid PatientId, string? Reason) : IDomainEvent, INotification;
