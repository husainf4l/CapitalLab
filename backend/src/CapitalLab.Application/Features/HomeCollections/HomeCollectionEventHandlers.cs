using CapitalLab.Domain.Events;
using MediatR;
using Microsoft.Extensions.Logging;

namespace CapitalLab.Application.Features.HomeCollections;

public class HomeCollectionAssignedEventHandler(ILogger<HomeCollectionAssignedEventHandler> logger) : INotificationHandler<HomeCollectionAssignedEvent>
{
    public Task Handle(HomeCollectionAssignedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogDebug("Home collection {HomeCollectionRequestId} assigned to staff {StaffProfileId}", notification.HomeCollectionRequestId, notification.StaffProfileId);
        return Task.CompletedTask;
    }
}

public class HomeCollectionStatusChangedEventHandler(ILogger<HomeCollectionStatusChangedEventHandler> logger) : INotificationHandler<HomeCollectionStatusChangedEvent>
{
    public Task Handle(HomeCollectionStatusChangedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogDebug("Home collection {HomeCollectionRequestId} status changed from {OldStatus} to {NewStatus}", notification.HomeCollectionRequestId, notification.OldStatus, notification.NewStatus);
        return Task.CompletedTask;
    }
}
