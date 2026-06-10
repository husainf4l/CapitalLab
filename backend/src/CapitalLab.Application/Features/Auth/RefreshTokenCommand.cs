using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Auth;
using CapitalLab.Contracts.Common;
using FluentValidation;
using MediatR;

namespace CapitalLab.Application.Features.Auth;

public record RefreshTokenCommand(
    string AccessToken,
    string RefreshToken) : IRequest<Result<LoginResponse>>;

public class RefreshTokenCommandValidator : AbstractValidator<RefreshTokenCommand>
{
    public RefreshTokenCommandValidator()
    {
        RuleFor(x => x.AccessToken).NotEmpty();
        RuleFor(x => x.RefreshToken).NotEmpty();
    }
}

public class RefreshTokenCommandHandler(IAuthService authService)
    : IRequestHandler<RefreshTokenCommand, Result<LoginResponse>>
{
    public Task<Result<LoginResponse>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken) =>
        authService.RefreshTokenAsync(request.AccessToken, request.RefreshToken, cancellationToken);
}
