namespace CapitalLab.Application.Common.Interfaces;

public interface IPatientNumberService
{
    Task<string> GenerateNextAsync(CancellationToken cancellationToken = default);
}
