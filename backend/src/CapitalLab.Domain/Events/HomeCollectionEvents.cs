using CapitalLab.Domain.Common;
using CapitalLab.Domain.Enums;
using MediatR;

namespace CapitalLab.Domain.Events;

public sealed record HomeCollectionAssignedEvent(Guid HomeCollectionRequestId, Guid StaffProfileId) : IDomainEvent, INotification;

public sealed record HomeCollectionStatusChangedEvent(
    Guid HomeCollectionRequestId,
    HomeCollectionStatus OldStatus,
    HomeCollectionStatus NewStatus) : IDomainEvent, INotification;
