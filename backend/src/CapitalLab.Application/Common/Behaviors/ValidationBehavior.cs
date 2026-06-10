using FluentValidation;
using MediatR;
using ValidationException = CapitalLab.Application.Common.Exceptions.ValidationException;

namespace CapitalLab.Application.Common.Behaviors;

/// <summary>
/// MediatR pipeline behavior that runs all registered FluentValidation validators
/// for the incoming request before the handler executes.
/// Aggregates all failures and throws a single ValidationException.
/// </summary>
public sealed class ValidationBehavior<TRequest, TResponse>(
    IEnumerable<IValidator<TRequest>> validators)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (!validators.Any())
            return await next();

        var context = new ValidationContext<TRequest>(request);

        var validationResults = await Task.WhenAll(
            validators.Select(v => v.ValidateAsync(context, cancellationToken)));

        var failures = validationResults
            .SelectMany(r => r.Errors)
            .Where(f => f is not null)
            .ToList();

        if (failures.Count == 0)
            return await next();

        var errors = failures
            .GroupBy(f => f.PropertyName, f => f.ErrorMessage)
            .ToDictionary(g => g.Key, g => g.ToArray());

        throw new ValidationException(errors);
    }
}
