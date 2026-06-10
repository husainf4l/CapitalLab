using CapitalLab.Contracts.Auth;
using CapitalLab.Contracts.Common;

namespace CapitalLab.Application.Common.Interfaces;

public interface IAuthService
{
    Task<Result<LoginResponse>> LoginAsync(string email, string password, CancellationToken ct = default);
    Task<Result<LoginResponse>> RefreshTokenAsync(string accessToken, string refreshToken, CancellationToken ct = default);
    Task<Result> LogoutAsync(Guid userId, CancellationToken ct = default);
    Task<Result<AuthUserResponse>> GetCurrentUserAsync(Guid userId, CancellationToken ct = default);
    Task<Result> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword, CancellationToken ct = default);
}
