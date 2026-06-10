using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Application.Features.Auth;
using CapitalLab.Contracts.Auth;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace CapitalLab.Api.Controllers.V1;

public class AuthController(IMediator mediator, ICurrentUserService currentUser) : BaseController(mediator)
{
    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var result = await Mediator.Send(new LoginCommand(request.Email, request.Password, request.RememberMe), ct);

        if (result.IsFailure)
            return result.ErrorCode switch
            {
                "AUTH_ACCOUNT_LOCKED" => StatusCode(423, new { result.ErrorCode, result.ErrorMessage }),
                "AUTH_ACCOUNT_DISABLED" => StatusCode(403, new { result.ErrorCode, result.ErrorMessage }),
                _ => Unauthorized(new { result.ErrorCode, result.ErrorMessage })
            };

        return OkResponse(result.Value, "Login successful.");
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request, CancellationToken ct)
    {
        var result = await Mediator.Send(new RefreshTokenCommand(request.AccessToken, request.RefreshToken), ct);

        if (result.IsFailure)
            return Unauthorized(new { result.ErrorCode, result.ErrorMessage });

        return OkResponse(result.Value);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        var userId = currentUser.UserId;
        if (userId.HasValue)
            await Mediator.Send(new LogoutCommand(userId.Value), ct);

        return NoContentResponse();
    }

    [HttpGet("me")]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        var userId = currentUser.UserId;
        if (!userId.HasValue)
            return Unauthorized();

        var result = await Mediator.Send(new GetCurrentUserQuery(userId.Value), ct);

        if (result.IsFailure)
            return NotFound(new { result.ErrorMessage });

        return OkResponse(result.Value);
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken ct)
    {
        var userId = currentUser.UserId;
        if (!userId.HasValue)
            return Unauthorized();

        var result = await Mediator.Send(
            new ChangePasswordCommand(userId.Value, request.CurrentPassword, request.NewPassword, request.ConfirmPassword), ct);

        if (result.IsFailure)
            return FailResponse(result.ErrorMessage!, result.Errors);

        return OkResponse(true, "Password changed successfully.");
    }
}
