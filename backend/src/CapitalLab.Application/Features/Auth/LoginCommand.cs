using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Auth;
using CapitalLab.Contracts.Common;
using FluentValidation;
using MediatR;

namespace CapitalLab.Application.Features.Auth;

public record LoginCommand(
    string Email,
    string Password,
    bool RememberMe = false) : IRequest<Result<LoginResponse>>;

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public class LoginCommandHandler(IAuthService authService)
    : IRequestHandler<LoginCommand, Result<LoginResponse>>
{
    public Task<Result<LoginResponse>> Handle(LoginCommand request, CancellationToken cancellationToken) =>
        authService.LoginAsync(request.Email, request.Password, cancellationToken);
}
