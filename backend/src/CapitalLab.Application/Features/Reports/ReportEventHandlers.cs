using CapitalLab.Domain.Events;
using MediatR;
using Microsoft.Extensions.Logging;

namespace CapitalLab.Application.Features.Reports;

// Phase 3 prepares the notification pipeline; handlers log only — no real notifications are sent yet.

public class ReportGeneratedEventHandler(ILogger<ReportGeneratedEventHandler> logger) : INotificationHandler<ReportGeneratedEvent>
{
    public Task Handle(ReportGeneratedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation("Report {ReportId} generated for patient {PatientId} (sample {SampleId})",
            notification.ReportId, notification.PatientId, notification.SampleId);
        return Task.CompletedTask;
    }
}

public class ReportReleasedEventHandler(ILogger<ReportReleasedEventHandler> logger) : INotificationHandler<ReportReleasedEvent>
{
    public Task Handle(ReportReleasedEvent notification, CancellationToken cancellationToken)
    {
        // Releasing a report makes it visible on the patient portal — wire portal/SMS/email notifications later.
        logger.LogInformation("Report {ReportId} released for patient {PatientId}", notification.ReportId, notification.PatientId);
        return Task.CompletedTask;
    }
}
