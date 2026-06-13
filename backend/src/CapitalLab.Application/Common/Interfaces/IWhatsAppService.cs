namespace CapitalLab.Application.Common.Interfaces;

public interface IWhatsAppService
{
    Task SendAsync(string phoneNumber, string message, CancellationToken cancellationToken = default);
    Task SendTemplatedAsync(string phoneNumber, string templateCode, Dictionary<string, string> variables, CancellationToken cancellationToken = default);
}
