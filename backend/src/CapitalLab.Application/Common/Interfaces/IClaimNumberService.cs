namespace CapitalLab.Application.Common.Interfaces;

public interface IClaimNumberService
{
    Task<string> GenerateNextAsync(DateOnly claimDate, CancellationToken cancellationToken = default);
}
