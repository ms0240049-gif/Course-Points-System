using System.Security.Claims;
using CoursePoints.Api.Domain;
using CoursePoints.Api.DTOs;
using CoursePoints.Api.Extensions;
using CoursePoints.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoursePoints.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CoursesController(ICourseService courseService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CourseDto>>> GetCourses(CancellationToken cancellationToken)
    {
        var role = User.FindFirstValue(ClaimTypes.Role) ?? AppRoles.Student;
        return Ok(await courseService.GetCoursesAsync(User.GetUserId(), role, cancellationToken));
    }

    [HttpPost]
    [Authorize(Roles = AppRoles.Admin + "," + AppRoles.Instructor)]
    public async Task<ActionResult<CourseDto>> Create(CreateCourseRequest request, CancellationToken cancellationToken)
    {
        var course = await courseService.CreateCourseAsync(User.GetUserId(), request, cancellationToken);
        return CreatedAtAction(nameof(GetCourses), new { id = course.Id }, course);
    }

    [HttpPut("{courseId:guid}")]
    [Authorize(Roles = AppRoles.Admin + "," + AppRoles.Instructor)]
    public async Task<ActionResult<CourseDto>> Update(Guid courseId, UpdateCourseRequest request, CancellationToken cancellationToken)
    {
        return Ok(await courseService.UpdateCourseAsync(User.GetUserId(), GetRole(), courseId, request, cancellationToken));
    }

    [HttpDelete("{courseId:guid}")]
    [Authorize(Roles = AppRoles.Admin + "," + AppRoles.Instructor)]
    public async Task<IActionResult> Delete(Guid courseId, CancellationToken cancellationToken)
    {
        await courseService.DeleteCourseAsync(User.GetUserId(), GetRole(), courseId, cancellationToken);
        return NoContent();
    }

    [HttpPost("{courseId:guid}/sessions")]
    [Authorize(Roles = AppRoles.Admin + "," + AppRoles.Instructor)]
    public async Task<ActionResult<CourseSessionDto>> CreateSession(Guid courseId, CreateCourseSessionRequest request, CancellationToken cancellationToken)
    {
        return Ok(await courseService.CreateSessionAsync(User.GetUserId(), GetRole(), courseId, request, cancellationToken));
    }

    [HttpGet("{courseId:guid}/sessions")]
    public async Task<ActionResult<IReadOnlyList<CourseSessionDto>>> GetSessions(Guid courseId, CancellationToken cancellationToken)
    {
        return Ok(await courseService.GetSessionsAsync(User.GetUserId(), GetRole(), courseId, cancellationToken));
    }

    [HttpPost("{courseId:guid}/students")]
    [Authorize(Roles = AppRoles.Admin + "," + AppRoles.Instructor)]
    public async Task<IActionResult> AssignStudent(Guid courseId, AssignStudentRequest request, CancellationToken cancellationToken)
    {
        await courseService.AssignStudentAsync(User.GetUserId(), GetRole(), courseId, request, cancellationToken);
        return NoContent();
    }

    [HttpGet("{courseId:guid}/students")]
    public async Task<ActionResult<IReadOnlyList<CourseStudentSummaryDto>>> GetCourseStudents(Guid courseId, CancellationToken cancellationToken)
    {
        return Ok(await courseService.GetCourseStudentsAsync(User.GetUserId(), GetRole(), courseId, cancellationToken));
    }

    [HttpGet("{courseId:guid}/students/assignable")]
    [Authorize(Roles = AppRoles.Admin + "," + AppRoles.Instructor)]
    public async Task<ActionResult<IReadOnlyList<StudentDto>>> GetAssignableStudents(Guid courseId, CancellationToken cancellationToken)
    {
        return Ok(await courseService.GetAssignableStudentsAsync(User.GetUserId(), GetRole(), courseId, cancellationToken));
    }

    [HttpDelete("{courseId:guid}/students/{studentId:guid}")]
    [Authorize(Roles = AppRoles.Admin + "," + AppRoles.Instructor)]
    public async Task<IActionResult> RemoveStudent(Guid courseId, Guid studentId, CancellationToken cancellationToken)
    {
        await courseService.RemoveStudentAsync(User.GetUserId(), GetRole(), courseId, studentId, cancellationToken);
        return NoContent();
    }

    [HttpPost("{courseId:guid}/instructors")]
    [Authorize(Roles = AppRoles.Admin + "," + AppRoles.Instructor)]
    public async Task<IActionResult> AssignInstructor(Guid courseId, AssignInstructorRequest request, CancellationToken cancellationToken)
    {
        await courseService.AssignInstructorAsync(User.GetUserId(), GetRole(), courseId, request, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{courseId:guid}/instructors/{instructorId:guid}")]
    [Authorize(Roles = AppRoles.Admin + "," + AppRoles.Instructor)]
    public async Task<IActionResult> RemoveInstructor(Guid courseId, Guid instructorId, CancellationToken cancellationToken)
    {
        await courseService.RemoveInstructorAsync(User.GetUserId(), GetRole(), courseId, instructorId, cancellationToken);
        return NoContent();
    }

    [HttpGet("{courseId:guid}/instructors")]
    [Authorize(Roles = AppRoles.Admin + "," + AppRoles.Instructor)]
    public async Task<ActionResult<IReadOnlyList<CourseInstructorDto>>> GetCourseInstructors(Guid courseId, CancellationToken cancellationToken)
    {
        return Ok(await courseService.GetCourseInstructorsAsync(courseId, cancellationToken));
    }

    private string GetRole() => User.FindFirstValue(ClaimTypes.Role) ?? AppRoles.Student;
}
