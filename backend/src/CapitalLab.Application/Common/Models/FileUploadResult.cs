namespace CapitalLab.Application.Common.Models;

public sealed record FileUploadResult(
    string StoragePath,
    string FileName,
    string ContentType,
    long SizeBytes,
    string PublicUrl);
