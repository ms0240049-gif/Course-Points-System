using CoursePoints.Api.Domain;
using CoursePoints.Api.DTOs;
using CoursePoints.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoursePoints.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = AppRoles.Admin)]
public class UsersController(IAdminService adminService) : ControllerBase
{
    [HttpPut("{userId:guid}/password")]
    public async Task<IActionResult> ResetPassword(Guid userId, ResetUserPasswordRequest request, CancellationToken cancellationToken)
    {
        await adminService.ResetUserPasswordAsync(userId, request, cancellationToken);
        return NoContent();
    }
}
