namespace CapitalLab.Contracts.Common;

/// <summary>
/// Uniform JSON envelope for all API responses.
/// </summary>
public sealed class ApiResponse<T>
{
    public bool Success { get; init; }
    public T? Data { get; init; }
    public string? Message { get; init; }
    public IReadOnlyList<string> Errors { get; init; } = [];
    public string TraceId { get; init; } = string.Empty;

    public static ApiResponse<T> Ok(T data, string? message = null) =>
        new() { Success = true, Data = data, Message = message };

    public static ApiResponse<T> Fail(string message, IEnumerable<string>? errors = null) =>
        new() { Success = false, Message = message, Errors = errors?.ToList() ?? [] };
}

public sealed class ApiResponse
{
    public bool Success { get; init; }
    public string? Message { get; init; }
    public IReadOnlyList<string> Errors { get; init; } = [];
    public string TraceId { get; init; } = string.Empty;

    public static ApiResponse Ok(string? message = null) =>
        new() { Success = true, Message = message };

    public static ApiResponse Fail(string message, IEnumerable<string>? errors = null) =>
        new() { Success = false, Message = message, Errors = errors?.ToList() ?? [] };
}
