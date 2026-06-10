namespace CapitalLab.Application.Common.Interfaces;

/// <summary>
/// Abstracts DateTime.UtcNow for testability.
/// </summary>
public interface IDateTimeService
{
    DateTime UtcNow { get; }
    DateOnly UtcToday { get; }
    long UnixTimestampSeconds { get; }
}
