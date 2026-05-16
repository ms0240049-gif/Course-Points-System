using CoursePoints.Api.Entities;

namespace CoursePoints.Api.Services;

public record AccessTokenResult(string Token, DateTimeOffset ExpiresAt);
public record RefreshTokenResult(string Token, string TokenHash, DateTimeOffset ExpiresAt);

public interface ITokenService
{
    AccessTokenResult CreateAccessToken(ApplicationUser user);
    RefreshTokenResult CreateRefreshToken();
    string HashToken(string token);
}
