using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Application.Common.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CapitalLab.Infrastructure.Services;

/// <summary>
/// Local file system storage provider.
/// All files are stored under the configured root path with folder-based organization.
/// Replace with S3StorageProvider in production by swapping the DI registration.
/// </summary>
public sealed class LocalFileStorageService(
    IConfiguration configuration,
    ILogger<LocalFileStorageService> logger) : IFileStorageService
{
    private readonly string _rootPath =
        configuration["Storage:LocalRootPath"] ?? Path.Combine(Directory.GetCurrentDirectory(), "uploads");

    private readonly string _baseUrl =
        configuration["Storage:BaseUrl"] ?? "http://localhost:5000/files";

    public async Task<FileUploadResult> UploadAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        string folder,
        CancellationToken cancellationToken = default)
    {
        var sanitizedFileName = SanitizeFileName(fileName);
        var uniqueFileName = $"{Guid.NewGuid():N}_{sanitizedFileName}";
        var folderPath = Path.Combine(_rootPath, folder);
        var filePath = Path.Combine(folderPath, uniqueFileName);
        var storagePath = Path.Combine(folder, uniqueFileName).Replace('\\', '/');

        Directory.CreateDirectory(folderPath);

        await using var fs = File.Create(filePath);
        await fileStream.CopyToAsync(fs, cancellationToken);

        var sizeBytes = new FileInfo(filePath).Length;

        logger.LogDebug("Stored file {FileName} at {StoragePath} ({SizeBytes} bytes)",
            sanitizedFileName, storagePath, sizeBytes);

        return new FileUploadResult(
            StoragePath: storagePath,
            FileName: sanitizedFileName,
            ContentType: contentType,
            SizeBytes: sizeBytes,
            PublicUrl: GetAccessUrl(storagePath));
    }

    public async Task<Stream?> DownloadAsync(string storagePath, CancellationToken cancellationToken = default)
    {
        var filePath = Path.Combine(_rootPath, storagePath.Replace('/', Path.DirectorySeparatorChar));
        if (!File.Exists(filePath)) return null;

        return await Task.FromResult<Stream>(File.OpenRead(filePath));
    }

    public Task<bool> DeleteAsync(string storagePath, CancellationToken cancellationToken = default)
    {
        var filePath = Path.Combine(_rootPath, storagePath.Replace('/', Path.DirectorySeparatorChar));
        if (!File.Exists(filePath)) return Task.FromResult(false);

        File.Delete(filePath);
        return Task.FromResult(true);
    }

    public Task<bool> ExistsAsync(string storagePath, CancellationToken cancellationToken = default)
    {
        var filePath = Path.Combine(_rootPath, storagePath.Replace('/', Path.DirectorySeparatorChar));
        return Task.FromResult(File.Exists(filePath));
    }

    public string GetAccessUrl(string storagePath, TimeSpan? expiry = null) =>
        $"{_baseUrl.TrimEnd('/')}/{storagePath.TrimStart('/')}";

    private static string SanitizeFileName(string fileName)
    {
        var invalid = Path.GetInvalidFileNameChars();
        return string.Concat(Path.GetFileNameWithoutExtension(fileName)
            .Where(c => !invalid.Contains(c)))
            + Path.GetExtension(fileName);
    }
}
