namespace CapitalLab.Application.Common.Interfaces;

public interface ISystemInfoService
{
    Task<string> GetLastMigrationAsync(CancellationToken ct = default);
}
