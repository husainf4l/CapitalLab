namespace CapitalLab.Application.Common.Interfaces;

public interface IEmailService
{
    Task SendAsync(
        string to,
        string subject,
        string htmlBody,
        string? plainTextBody = null,
        IEnumerable<string>? cc = null,
        CancellationToken cancellationToken = default);

    Task SendTemplatedAsync(
        string to,
        string templateCode,
        Dictionary<string, string> variables,
        string language = "en",
        CancellationToken cancellationToken = default);
}
