using System.Diagnostics;
using CoursePoints.Api.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace CoursePoints.Api.Middleware;

public class GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception exception)
        {
            var statusCode = exception is ApiException apiException
                ? apiException.StatusCode
                : StatusCodes.Status500InternalServerError;

            if (statusCode >= 500)
            {
                try
                {
                    logger.LogError(exception, "Unhandled exception while processing {Path}", context.Request.Path);
                }
                catch
                {
                    // Never let a logging provider failure replace the original API response.
                }
            }

            var problem = new ProblemDetails
            {
                Status = statusCode,
                Title = statusCode >= 500 ? "An unexpected error occurred." : exception.Message,
                Detail = statusCode >= 500 ? null : exception.Message,
                Instance = context.Request.Path
            };
            problem.Extensions["traceId"] = Activity.Current?.Id ?? context.TraceIdentifier;

            context.Response.StatusCode = statusCode;
            await context.Response.WriteAsJsonAsync(problem);
        }
    }
}
