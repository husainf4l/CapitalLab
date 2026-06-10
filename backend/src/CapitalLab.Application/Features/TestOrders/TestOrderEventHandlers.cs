using CapitalLab.Domain.Events;
using MediatR;
using Microsoft.Extensions.Logging;

namespace CapitalLab.Application.Features.TestOrders;

public class TestOrderCreatedEventHandler(ILogger<TestOrderCreatedEventHandler> logger) : INotificationHandler<TestOrderCreatedEvent>
{
    public Task Handle(TestOrderCreatedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogDebug("Test order {TestOrderId} created for patient {PatientId}", notification.TestOrderId, notification.PatientId);
        return Task.CompletedTask;
    }
}

public class TestOrderCancelledEventHandler(ILogger<TestOrderCancelledEventHandler> logger) : INotificationHandler<TestOrderCancelledEvent>
{
    public Task Handle(TestOrderCancelledEvent notification, CancellationToken cancellationToken)
    {
        logger.LogDebug("Test order {TestOrderId} cancelled: {Reason}", notification.TestOrderId, notification.Reason);
        return Task.CompletedTask;
    }
}
