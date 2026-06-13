using System.Security.Claims;
using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Auth;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Interfaces;
using CapitalLab.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;

namespace CapitalLab.Infrastructure.Services;

public sealed class AuthService(
    UserManager<AppUser> userManager,
    ITokenService tokenService,
    IRepository<Patient> patientRepo,
    IPatientNumberService patientNumberService,
    IUnitOfWork uow)
    : IAuthService
{
    private const string LoginProvider = "CapitalLab";
    private const string RefreshTokenName = "RefreshToken";
    private const string RefreshExpiryName = "RefreshTokenExpiry";

    public async Task<Result<LoginResponse>> LoginAsync(string email, string password, CancellationToken ct = default)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user is null || user.IsDeleted)
            return Result<LoginResponse>.Failure("AUTH_INVALID_CREDENTIALS", "Invalid email or password.");

        if (!user.IsActive)
            return Result<LoginResponse>.Failure("AUTH_ACCOUNT_DISABLED", "Your account has been disabled. Please contact support.");

        if (await userManager.IsLockedOutAsync(user))
            return Result<LoginResponse>.Failure("AUTH_ACCOUNT_LOCKED", "Account is locked. Try again in 15 minutes.");

        if (!await userManager.CheckPasswordAsync(user, password))
        {
            await userManager.AccessFailedAsync(user);
            return Result<LoginResponse>.Failure("AUTH_INVALID_CREDENTIALS", "Invalid email or password.");
        }

        await userManager.ResetAccessFailedCountAsync(user);
        return await BuildLoginResponseAsync(user);
    }

    public async Task<Result<LoginResponse>> RefreshTokenAsync(string accessToken, string refreshToken, CancellationToken ct = default)
    {
        var principal = tokenService.ValidateToken(accessToken, validateLifetime: false);
        if (principal is null)
            return Result<LoginResponse>.Failure("AUTH_INVALID_TOKEN", "Invalid access token.");

        var userIdStr = principal.FindFirstValue(ClaimTypes.NameIdentifier)
                        ?? principal.FindFirstValue("sub");

        if (!Guid.TryParse(userIdStr, out var userId))
            return Result<LoginResponse>.Failure("AUTH_INVALID_TOKEN", "Invalid token claims.");

        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user is null || user.IsDeleted || !user.IsActive)
            return Result<LoginResponse>.Failure("AUTH_INVALID_TOKEN", "User not found or inactive.");

        var storedHash = await userManager.GetAuthenticationTokenAsync(user, LoginProvider, RefreshTokenName);
        var storedExpiryStr = await userManager.GetAuthenticationTokenAsync(user, LoginProvider, RefreshExpiryName);

        if (storedHash is null || storedExpiryStr is null)
            return Result<LoginResponse>.Failure("AUTH_INVALID_REFRESH", "Refresh token not found. Please log in again.");

        if (!DateTime.TryParse(storedExpiryStr, out var storedExpiry) || storedExpiry < DateTime.UtcNow)
            return Result<LoginResponse>.Failure("AUTH_REFRESH_EXPIRED", "Refresh token has expired. Please log in again.");

        var incomingHash = tokenService.HashRefreshToken(refreshToken);
        if (incomingHash != storedHash)
            return Result<LoginResponse>.Failure("AUTH_INVALID_REFRESH", "Invalid refresh token.");

        return await BuildLoginResponseAsync(user);
    }

    public async Task<Result> LogoutAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user is null) return Result.Success();

        await userManager.RemoveAuthenticationTokenAsync(user, LoginProvider, RefreshTokenName);
        await userManager.RemoveAuthenticationTokenAsync(user, LoginProvider, RefreshExpiryName);

        return Result.Success();
    }

    public async Task<Result<AuthUserResponse>> GetCurrentUserAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user is null || user.IsDeleted)
            return Result<AuthUserResponse>.Failure("NOT_FOUND", "User not found.");

        var roles = (await userManager.GetRolesAsync(user)).ToArray();
        return Result<AuthUserResponse>.Success(MapToUserResponse(user, roles));
    }

    public async Task<Result> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword, CancellationToken ct = default)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user is null)
            return Result.Failure("NOT_FOUND", "User not found.");

        var result = await userManager.ChangePasswordAsync(user, currentPassword, newPassword);
        if (!result.Succeeded)
            return Result.Failure("PASSWORD_CHANGE_FAILED", result.Errors.Select(e => e.Description));

        return Result.Success();
    }

    public async Task<Result<LoginResponse>> RegisterPatientAsync(
        string firstName, string lastName, string email, string phone,
        int gender, DateOnly dateOfBirth, string password,
        CancellationToken ct = default)
    {
        if (await userManager.FindByEmailAsync(email) is not null)
            return Result<LoginResponse>.Failure("AUTH_EMAIL_TAKEN", "An account with this email already exists.");

        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            FirstName = firstName.Trim(),
            LastName = lastName.Trim(),
            Email = email.Trim().ToLowerInvariant(),
            UserName = email.Trim().ToLowerInvariant(),
            IsActive = true,
        };

        var createResult = await userManager.CreateAsync(user, password);
        if (!createResult.Succeeded)
            return Result<LoginResponse>.Failure("REGISTRATION_FAILED",
                createResult.Errors.Select(e => e.Description));

        await userManager.AddToRoleAsync(user, "Patient");

        var patientNumber = await patientNumberService.GenerateNextAsync(ct);
        var patient = Patient.Create(
            patientNumber,
            firstName.Trim(), lastName.Trim(), null,
            (Gender)gender, dateOfBirth,
            null, null,
            phone.Trim(), email.Trim().ToLowerInvariant(),
            null, null, null,
            null, null,
            null, null,
            null, null);

        await patientRepo.AddAsync(patient, ct);
        await uow.CommitAsync(ct);

        return await BuildLoginResponseAsync(user);
    }

    private async Task<Result<LoginResponse>> BuildLoginResponseAsync(AppUser user)
    {
        var roles = (await userManager.GetRolesAsync(user)).ToArray();
        var accessToken = tokenService.GenerateAccessToken(
            userId: user.Id,
            email: user.Email!,
            fullName: user.FullName,
            roles: roles,
            permissions: []);

        var refreshToken = tokenService.GenerateRefreshToken();
        var refreshExpiry = tokenService.RefreshTokenExpiry;

        await userManager.SetAuthenticationTokenAsync(user, LoginProvider, RefreshTokenName,
            tokenService.HashRefreshToken(refreshToken));
        await userManager.SetAuthenticationTokenAsync(user, LoginProvider, RefreshExpiryName,
            refreshExpiry.ToString("O"));

        user.LastLoginAt = DateTime.UtcNow;
        await userManager.UpdateAsync(user);

        return Result<LoginResponse>.Success(new LoginResponse(
            AccessToken: accessToken,
            RefreshToken: refreshToken,
            AccessTokenExpiresAt: tokenService.AccessTokenExpiry,
            RefreshTokenExpiresAt: refreshExpiry,
            User: MapToUserResponse(user, roles)));
    }

    private static AuthUserResponse MapToUserResponse(AppUser user, string[] roles) =>
        new(
            Id: user.Id,
            Email: user.Email!,
            FullName: user.FullName,
            AvatarUrl: user.AvatarUrl,
            Roles: roles,
            LanguagePreference: user.LanguagePreference);
}
