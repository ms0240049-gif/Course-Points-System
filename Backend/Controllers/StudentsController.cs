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
public class StudentsController(IAdminService adminService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<StudentDto>> Create(CreateStudentRequest request, CancellationToken cancellationToken)
    {
        var student = await adminService.CreateStudentAsync(User.GetUserId(), GetRole(), request, cancellationToken);
        return CreatedAtAction(nameof(GetAll), new { id = student.Id }, student);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<StudentDto>>> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await adminService.GetStudentsAsync(User.GetUserId(), GetRole(), cancellationToken));
    }

    [HttpDelete("{studentId:guid}")]
    [Authorize(Roles = AppRoles.Admin + "," + AppRoles.Instructor)]
    public async Task<IActionResult> Delete(Guid studentId, CancellationToken cancellationToken)
    {
        await adminService.DeleteStudentAsync(User.GetUserId(), GetRole(), studentId, cancellationToken);
        return NoContent();
    }

    private string GetRole() => User.FindFirstValue(ClaimTypes.Role) ?? AppRoles.Student;
}
