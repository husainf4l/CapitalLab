namespace CapitalLab.Application.Common.Interfaces;

public interface ISmsService
{
    Task SendAsync(
        string phoneNumber,
        string message,
        CancellationToken cancellationToken = default);

    Task SendTemplatedAsync(
        string phoneNumber,
        string templateCode,
        Dictionary<string, string> variables,
        string language = "en",
        CancellationToken cancellationToken = default);
}
