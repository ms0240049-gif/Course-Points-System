using CoursePoints.Api.Data;
using CoursePoints.Api.DTOs;
using CoursePoints.Api.Entities;
using CoursePoints.Api.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace CoursePoints.Api.Services;

public class AuthService(AppDbContext dbContext, IPasswordHasher passwordHasher, ITokenService tokenService) : IAuthService
{
    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var email = NormalizeEmail(request.Email);
        var user = await dbContext.Users.SingleOrDefaultAsync(x => x.Email == email, cancellationToken);
        if (user is null || !user.IsActive || !passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            throw new ApiException("Invalid email or password.", StatusCodes.Status401Unauthorized);
        }

        return await CreateTokenResponseAsync(user, cancellationToken);
    }

    public async Task<AuthResponse> RefreshAsync(RefreshTokenRequest request, CancellationToken cancellationToken)
    {
        var tokenHash = tokenService.HashToken(request.RefreshToken);
        var storedToken = await dbContext.RefreshTokens
            .Include(x => x.User)
            .SingleOrDefaultAsync(x => x.TokenHash == tokenHash, cancellationToken);

        if (storedToken?.User is null || !storedToken.User.IsActive || !storedToken.IsActive)
        {
            throw new ApiException("Invalid refresh token.", StatusCodes.Status401Unauthorized);
        }

        var newRefreshToken = tokenService.CreateRefreshToken();
        storedToken.RevokedAt = DateTimeOffset.UtcNow;
        storedToken.ReplacedByTokenHash = newRefreshToken.TokenHash;

        dbContext.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            TokenHash = newRefreshToken.TokenHash,
            ExpiresAt = newRefreshToken.ExpiresAt,
            UserId = storedToken.UserId
        });

        var accessToken = tokenService.CreateAccessToken(storedToken.User);
        await dbContext.SaveChangesAsync(cancellationToken);

        return BuildAuthResponse(storedToken.User, accessToken, newRefreshToken);
    }

    public async Task LogoutAsync(LogoutRequest request, CancellationToken cancellationToken)
    {
        var tokenHash = tokenService.HashToken(request.RefreshToken);
        var storedToken = await dbContext.RefreshTokens.SingleOrDefaultAsync(x => x.TokenHash == tokenHash, cancellationToken);
        if (storedToken is not null && storedToken.RevokedAt is null)
        {
            storedToken.RevokedAt = DateTimeOffset.UtcNow;
            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<AuthResponse> ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken cancellationToken)
    {
        var user = await dbContext.Users.FindAsync([userId], cancellationToken)
            ?? throw new NotFoundException("User was not found.");

        if (!passwordHasher.Verify(request.CurrentPassword, user.PasswordHash))
        {
            throw new ApiException("Current password is incorrect.", StatusCodes.Status400BadRequest);
        }

        user.PasswordHash = passwordHasher.Hash(request.NewPassword);
        user.MustChangePassword = false;

        var activeTokens = await dbContext.RefreshTokens
            .Where(x => x.UserId == userId && x.RevokedAt == null)
            .ToListAsync(cancellationToken);

        foreach (var token in activeTokens)
        {
            token.RevokedAt = DateTimeOffset.UtcNow;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return await CreateTokenResponseAsync(user, cancellationToken);
    }

    private async Task<AuthResponse> CreateTokenResponseAsync(ApplicationUser user, CancellationToken cancellationToken)
    {
        var accessToken = tokenService.CreateAccessToken(user);
        var refreshToken = tokenService.CreateRefreshToken();

        dbContext.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            TokenHash = refreshToken.TokenHash,
            ExpiresAt = refreshToken.ExpiresAt,
            UserId = user.Id
        });
        await dbContext.SaveChangesAsync(cancellationToken);

        return BuildAuthResponse(user, accessToken, refreshToken);
    }

    private static AuthResponse BuildAuthResponse(ApplicationUser user, AccessTokenResult accessToken, RefreshTokenResult refreshToken)
    {
        return new AuthResponse(
            accessToken.Token,
            accessToken.ExpiresAt,
            refreshToken.Token,
            refreshToken.ExpiresAt,
            new UserDto(user.Id, user.Email, user.FullName, user.Role, user.MustChangePassword));
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
}
