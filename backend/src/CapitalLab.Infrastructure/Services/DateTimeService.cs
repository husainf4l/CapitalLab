using CapitalLab.Application.Common.Interfaces;

namespace CapitalLab.Infrastructure.Services;

public sealed class DateTimeService : IDateTimeService
{
    public DateTime UtcNow => DateTime.UtcNow;
    public DateOnly UtcToday => DateOnly.FromDateTime(DateTime.UtcNow);
    public long UnixTimestampSeconds => DateTimeOffset.UtcNow.ToUnixTimeSeconds();
}
