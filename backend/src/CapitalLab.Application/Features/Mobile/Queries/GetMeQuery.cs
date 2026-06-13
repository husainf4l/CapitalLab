using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Auth;
using CapitalLab.Contracts.Common;
using MediatR;

namespace CapitalLab.Application.Features.Mobile.Queries;

public record GetMeQuery : IRequest<Result<AuthUserResponse>>;

public class GetMeQueryHandler(
    ICurrentUserService currentUser,
    IAuthService authService) : IRequestHandler<GetMeQuery, Result<AuthUserResponse>>
{
    public async Task<Result<AuthUserResponse>> Handle(GetMeQuery request, CancellationToken ct)
    {
        if (currentUser.UserId is null)
            return Result<AuthUserResponse>.Failure("UNAUTHORIZED", "Not authenticated.");

        return await authService.GetCurrentUserAsync(currentUser.UserId.Value, ct);
    }
}
