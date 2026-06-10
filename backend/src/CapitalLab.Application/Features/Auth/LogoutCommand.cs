using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Common;
using MediatR;

namespace CapitalLab.Application.Features.Auth;

public record LogoutCommand(Guid UserId) : IRequest<Result>;

public class LogoutCommandHandler(IAuthService authService)
    : IRequestHandler<LogoutCommand, Result>
{
    public Task<Result> Handle(LogoutCommand request, CancellationToken cancellationToken) =>
        authService.LogoutAsync(request.UserId, cancellationToken);
}
