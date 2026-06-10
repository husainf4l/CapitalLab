namespace CapitalLab.Contracts.Common;

/// <summary>
/// Discriminated union result type for application layer operations.
/// Avoids throwing exceptions for expected failures (validation, not found, etc.).
/// </summary>
public class Result
{
    public bool IsSuccess { get; protected init; }
    public bool IsFailure => !IsSuccess;
    public string? ErrorCode { get; protected init; }
    public string? ErrorMessage { get; protected init; }
    public IReadOnlyList<string> Errors { get; protected init; } = [];

    protected Result() { }

    public static Result Success() => new() { IsSuccess = true };

    public static Result Failure(string errorCode, string errorMessage) =>
        new() { IsSuccess = false, ErrorCode = errorCode, ErrorMessage = errorMessage };

    public static Result Failure(string errorCode, IEnumerable<string> errors)
    {
        var errorList = errors.ToList();
        return new()
        {
            IsSuccess = false,
            ErrorCode = errorCode,
            ErrorMessage = errorList.FirstOrDefault(),
            Errors = errorList
        };
    }

    public static Result<T> Success<T>(T value) => Result<T>.Success(value);
    public static Result<T> Failure<T>(string errorCode, string errorMessage) =>
        Result<T>.Failure(errorCode, errorMessage);
}

/// <summary>
/// Result with a typed value payload.
/// </summary>
public sealed class Result<T> : Result
{
    public T? Value { get; private init; }

    private Result() { }

    public static Result<T> Success(T value) =>
        new() { IsSuccess = true, Value = value };

    public new static Result<T> Failure(string errorCode, string errorMessage) =>
        new() { IsSuccess = false, ErrorCode = errorCode, ErrorMessage = errorMessage };

    public static Result<T> Failure(string errorCode, IEnumerable<string> errors)
    {
        var errorList = errors.ToList();
        return new()
        {
            IsSuccess = false,
            ErrorCode = errorCode,
            ErrorMessage = errorList.FirstOrDefault(),
            Errors = errorList
        };
    }

    public TOut Match<TOut>(Func<T, TOut> onSuccess, Func<Result<T>, TOut> onFailure) =>
        IsSuccess ? onSuccess(Value!) : onFailure(this);
}
