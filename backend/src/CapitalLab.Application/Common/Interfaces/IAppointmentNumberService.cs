namespace CapitalLab.Application.Common.Interfaces;

public interface IAppointmentNumberService
{
    Task<string> GenerateNextAsync(DateOnly appointmentDate, CancellationToken cancellationToken = default);
}
