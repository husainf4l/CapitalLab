using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Auth;
using CapitalLab.Contracts.Common;
using FluentValidation;
using MediatR;

namespace CapitalLab.Application.Features.Auth;

public record RegisterPatientCommand(
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    int Gender,
    DateOnly DateOfBirth,
    string Password,
    string ConfirmPassword) : IRequest<Result<LoginResponse>>;

public class RegisterPatientCommandValidator : AbstractValidator<RegisterPatientCommand>
{
    public RegisterPatientCommandValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(200);
        RuleFor(x => x.Phone).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Gender).InclusiveBetween(0, 1);
        RuleFor(x => x.DateOfBirth)
            .NotEmpty()
            .LessThan(DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("Date of birth must be in the past.")
            .GreaterThan(DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-120)))
            .WithMessage("Invalid date of birth.");
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8).MaximumLength(100);
        RuleFor(x => x.ConfirmPassword)
            .Equal(x => x.Password)
            .WithMessage("Passwords do not match.");
    }
}

public class RegisterPatientCommandHandler(IAuthService authService)
    : IRequestHandler<RegisterPatientCommand, Result<LoginResponse>>
{
    public Task<Result<LoginResponse>> Handle(RegisterPatientCommand request, CancellationToken cancellationToken) =>
        authService.RegisterPatientAsync(
            request.FirstName, request.LastName,
            request.Email, request.Phone,
            request.Gender, request.DateOfBirth,
            request.Password, cancellationToken);
}
