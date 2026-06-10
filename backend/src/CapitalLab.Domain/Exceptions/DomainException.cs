namespace CapitalLab.Domain.Exceptions;

/// <summary>
/// Base for all domain-layer violations. These represent broken invariants,
/// not application-layer validation errors.
/// </summary>
public class DomainException : Exception
{
    public string Code { get; }

    public DomainException(string code, string message) : base(message)
    {
        Code = code;
    }

    public DomainException(string code, string message, Exception innerException)
        : base(message, innerException)
    {
        Code = code;
    }
}

/// <summary>Raised when an entity is not found by its ID.</summary>
public class EntityNotFoundException(string entityName, object key)
    : DomainException("ENTITY_NOT_FOUND", $"{entityName} with key '{key}' was not found.");

/// <summary>Raised when a business invariant is violated.</summary>
public class BusinessRuleViolationException(string rule, string message)
    : DomainException(rule, message);

/// <summary>Raised when an operation is attempted on a deleted entity.</summary>
public class EntityDeletedException(string entityName, Guid id)
    : DomainException("ENTITY_DELETED", $"{entityName} '{id}' has been deleted and cannot be modified.");
