using CoursePoints.Api.Domain;
using CoursePoints.Api.DTOs;
using CoursePoints.Api.Extensions;
using CoursePoints.Api.Services;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoursePoints.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = AppRoles.Admin + "," + AppRoles.Instructor)]
public class InstructorsController(IAdminService adminService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<InstructorDto>> Create(CreateInstructorRequest request, CancellationToken cancellationToken)
    {
        var instructor = await adminService.CreateInstructorAsync(User.GetUserId(), GetRole(), request, cancellationToken);
        return CreatedAtAction(nameof(GetAll), new { id = instructor.Id }, instructor);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<InstructorDto>>> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await adminService.GetInstructorsAsync(User.GetUserId(), GetRole(), cancellationToken));
    }

    [HttpDelete("{instructorId:guid}")]
    public async Task<IActionResult> Delete(Guid instructorId, CancellationToken cancellationToken)
    {
        await adminService.DeleteInstructorAsync(User.GetUserId(), GetRole(), instructorId, cancellationToken);
        return NoContent();
    }

    private string GetRole() => User.FindFirstValue(ClaimTypes.Role) ?? AppRoles.Student;
}
