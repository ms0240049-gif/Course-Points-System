using System.Security.Claims;

namespace CoursePoints.Api.Middleware;

public class MustChangePasswordMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value ?? string.Empty;
        var isAllowedAuthPath =
            path.Equals("/api/auth/change-password", StringComparison.OrdinalIgnoreCase) ||
            path.Equals("/api/auth/logout", StringComparison.OrdinalIgnoreCase);

        var mustChangePassword = context.User.Identity?.IsAuthenticated == true &&
            string.Equals(context.User.FindFirstValue("mustChangePassword"), "true", StringComparison.OrdinalIgnoreCase);

        if (mustChangePassword && !isAllowedAuthPath)
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(new
            {
                message = "Password change is required before using the system."
            });
            return;
        }

        await next(context);
    }
}
