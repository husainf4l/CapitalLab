using CapitalLab.Application.Common.Models;

namespace CapitalLab.Application.Common.Interfaces;

/// <summary>
/// File storage abstraction. Local implementation ships first; S3 implementation added later
/// by swapping the registered service — callers are unaffected.
/// </summary>
public interface IFileStorageService
{
    Task<FileUploadResult> UploadAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        string folder,
        CancellationToken cancellationToken = default);

    Task<Stream?> DownloadAsync(string storagePath, CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(string storagePath, CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(string storagePath, CancellationToken cancellationToken = default);

    /// <summary>Returns a time-limited URL (for local storage: a signed JWT-protected path).</summary>
    string GetAccessUrl(string storagePath, TimeSpan? expiry = null);
}
