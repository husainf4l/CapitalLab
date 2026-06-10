using CapitalLab.Domain.Events;
using MediatR;
using Microsoft.Extensions.Logging;

namespace CapitalLab.Application.Features.Appointments;

public class AppointmentCreatedEventHandler(ILogger<AppointmentCreatedEventHandler> logger) : INotificationHandler<AppointmentCreatedEvent>
{
    public Task Handle(AppointmentCreatedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogDebug("Appointment {AppointmentId} created for patient {PatientId}", notification.AppointmentId, notification.PatientId);
        return Task.CompletedTask;
    }
}

public class AppointmentConfirmedEventHandler(ILogger<AppointmentConfirmedEventHandler> logger) : INotificationHandler<AppointmentConfirmedEvent>
{
    public Task Handle(AppointmentConfirmedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogDebug("Appointment {AppointmentId} confirmed", notification.AppointmentId);
        return Task.CompletedTask;
    }
}

public class AppointmentCancelledEventHandler(ILogger<AppointmentCancelledEventHandler> logger) : INotificationHandler<AppointmentCancelledEvent>
{
    public Task Handle(AppointmentCancelledEvent notification, CancellationToken cancellationToken)
    {
        logger.LogDebug("Appointment {AppointmentId} cancelled: {Reason}", notification.AppointmentId, notification.Reason);
        return Task.CompletedTask;
    }
}

public class AppointmentCompletedEventHandler(ILogger<AppointmentCompletedEventHandler> logger) : INotificationHandler<AppointmentCompletedEvent>
{
    public Task Handle(AppointmentCompletedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogDebug("Appointment {AppointmentId} completed", notification.AppointmentId);
        return Task.CompletedTask;
    }
}
