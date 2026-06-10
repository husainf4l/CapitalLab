using CapitalLab.Domain.Events;
using MediatR;
using Microsoft.Extensions.Logging;

namespace CapitalLab.Application.Features.Samples;

// Phase 3 prepares the notification pipeline; handlers log only — no real notifications are sent yet.

public class SampleCollectedEventHandler(ILogger<SampleCollectedEventHandler> logger) : INotificationHandler<SampleCollectedEvent>
{
    public Task Handle(SampleCollectedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation("Sample {SampleId} collected for patient {PatientId} (order {TestOrderId})",
            notification.SampleId, notification.PatientId, notification.TestOrderId);
        return Task.CompletedTask;
    }
}

public class SampleReceivedEventHandler(ILogger<SampleReceivedEventHandler> logger) : INotificationHandler<SampleReceivedEvent>
{
    public Task Handle(SampleReceivedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation("Sample {SampleId} received at the lab", notification.SampleId);
        return Task.CompletedTask;
    }
}

public class SampleProcessingStartedEventHandler(ILogger<SampleProcessingStartedEventHandler> logger) : INotificationHandler<SampleProcessingStartedEvent>
{
    public Task Handle(SampleProcessingStartedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation("Sample {SampleId} processing started", notification.SampleId);
        return Task.CompletedTask;
    }
}

public class SampleCompletedEventHandler(ILogger<SampleCompletedEventHandler> logger) : INotificationHandler<SampleCompletedEvent>
{
    public Task Handle(SampleCompletedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation("Sample {SampleId} completed for patient {PatientId}", notification.SampleId, notification.PatientId);
        return Task.CompletedTask;
    }
}
