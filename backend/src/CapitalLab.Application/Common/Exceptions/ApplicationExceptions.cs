namespace CapitalLab.Application.Common.Exceptions;

/// <summary>Thrown when FluentValidation finds invalid input.</summary>
public sealed class ValidationException : Exception
{
    public IDictionary<string, string[]> Errors { get; }

    public ValidationException(IDictionary<string, string[]> errors)
        : base("One or more validation failures occurred.")
    {
        Errors = errors;
    }

    public ValidationException(string field, string message)
        : this(new Dictionary<string, string[]> { { field, [message] } })
    { }
}

/// <summary>Thrown when the resource does not exist or the caller cannot see it.</summary>
public sealed class NotFoundException(string entityName, object key)
    : Exception($"{entityName} with identifier '{key}' was not found.");

/// <summary>Thrown when the caller is not authenticated.</summary>
public sealed class UnauthorizedException(string message = "Authentication is required.")
    : Exception(message);

/// <summary>Thrown when the caller is authenticated but lacks the required permission.</summary>
public sealed class ForbiddenException(string message = "You do not have permission to perform this action.")
    : Exception(message);

/// <summary>Thrown when a business rule is violated at the application layer.</summary>
public sealed class BusinessRuleException(string code, string message) : Exception(message)
{
    public string Code { get; } = code;
}

/// <summary>Thrown when a resource already exists and duplicates are not allowed.</summary>
public sealed class ConflictException(string message) : Exception(message);
