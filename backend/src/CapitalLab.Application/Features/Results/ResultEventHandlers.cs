using CapitalLab.Domain.Events;
using MediatR;
using Microsoft.Extensions.Logging;

namespace CapitalLab.Application.Features.Results;

// Phase 3 prepares the notification pipeline; handlers log only — no real notifications are sent yet.

public class ResultEnteredEventHandler(ILogger<ResultEnteredEventHandler> logger) : INotificationHandler<ResultEnteredEvent>
{
    public Task Handle(ResultEnteredEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation("Result {TestResultId} entered for patient {PatientId} (test {LabTestId})",
            notification.TestResultId, notification.PatientId, notification.LabTestId);
        return Task.CompletedTask;
    }
}

public class ResultApprovedEventHandler(ILogger<ResultApprovedEventHandler> logger) : INotificationHandler<ResultApprovedEvent>
{
    public Task Handle(ResultApprovedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation("Result {TestResultId} approved by {ApprovedBy}", notification.TestResultId, notification.ApprovedBy);
        return Task.CompletedTask;
    }
}

public class CriticalResultDetectedEventHandler(ILogger<CriticalResultDetectedEventHandler> logger) : INotificationHandler<CriticalResultDetectedEvent>
{
    public Task Handle(CriticalResultDetectedEvent notification, CancellationToken cancellationToken)
    {
        // Critical results warrant urgent attention — escalate via real alert channels in a later phase.
        logger.LogWarning("CRITICAL result {TestResultId} for patient {PatientId} (test {LabTestId}): {Reason}. Alert {AlertId} raised.",
            notification.TestResultId, notification.PatientId, notification.LabTestId, notification.TriggerReason, notification.CriticalResultAlertId);
        return Task.CompletedTask;
    }
}
