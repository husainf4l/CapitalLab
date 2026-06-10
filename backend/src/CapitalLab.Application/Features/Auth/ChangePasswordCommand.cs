using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Common;
using FluentValidation;
using MediatR;

namespace CapitalLab.Application.Features.Auth;

public record ChangePasswordCommand(
    Guid UserId,
    string CurrentPassword,
    string NewPassword,
    string ConfirmPassword) : IRequest<Result>;

public class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordCommandValidator()
    {
        RuleFor(x => x.CurrentPassword).NotEmpty();
        RuleFor(x => x.NewPassword).NotEmpty().MinimumLength(8);
        RuleFor(x => x.ConfirmPassword).Equal(x => x.NewPassword).WithMessage("Passwords do not match.");
    }
}

public class ChangePasswordCommandHandler(IAuthService authService)
    : IRequestHandler<ChangePasswordCommand, Result>
{
    public Task<Result> Handle(ChangePasswordCommand request, CancellationToken cancellationToken) =>
        authService.ChangePasswordAsync(request.UserId, request.CurrentPassword, request.NewPassword, cancellationToken);
}
