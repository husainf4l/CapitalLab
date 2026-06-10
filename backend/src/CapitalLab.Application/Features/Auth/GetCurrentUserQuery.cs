using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Auth;
using CapitalLab.Contracts.Common;
using MediatR;

namespace CapitalLab.Application.Features.Auth;

public record GetCurrentUserQuery(Guid UserId) : IRequest<Result<AuthUserResponse>>;

public class GetCurrentUserQueryHandler(IAuthService authService)
    : IRequestHandler<GetCurrentUserQuery, Result<AuthUserResponse>>
{
    public Task<Result<AuthUserResponse>> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken) =>
        authService.GetCurrentUserAsync(request.UserId, cancellationToken);
}
