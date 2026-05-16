using System.Security.Claims;
using CoursePoints.Api.Domain;
using CoursePoints.Api.DTOs;
using CoursePoints.Api.Extensions;
using CoursePoints.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoursePoints.Api.Controllers;

[ApiController]
[Route("api/courses/{courseId:guid}/points")]
[Authorize]
public class PointsController(IPointsService pointsService) : ControllerBase
{
    [HttpGet("leaderboard")]
    public async Task<ActionResult<IReadOnlyList<LeaderboardEntryDto>>> Leaderboard(Guid courseId, CancellationToken cancellationToken)
    {
        return Ok(await pointsService.GetLeaderboardAsync(User.GetUserId(), GetRole(), courseId, cancellationToken));
    }

    [HttpGet("students/{studentId:guid}")]
    public async Task<ActionResult<IReadOnlyList<PointsLogDto>>> StudentPoints(Guid courseId, Guid studentId, CancellationToken cancellationToken)
    {
        return Ok(await pointsService.GetStudentPointsAsync(User.GetUserId(), GetRole(), courseId, studentId, cancellationToken));
    }

    [HttpPost("attendance")]
    [Authorize(Roles = AppRoles.Admin + "," + AppRoles.Instructor)]
    public async Task<ActionResult<PointsLogDto>> Attendance(Guid courseId, AttendancePointsRequest request, CancellationToken cancellationToken)
    {
        return Ok(await pointsService.AddAttendanceAsync(User.GetUserId(), GetRole(), courseId, request, cancellationToken));
    }

    [HttpPost("attendance/bulk")]
    [Authorize(Roles = AppRoles.Admin + "," + AppRoles.Instructor)]
    public async Task<ActionResult<BulkAttendanceSummaryDto>> BulkAttendance(Guid courseId, BulkAttendanceRequest request, CancellationToken cancellationToken)
    {
        return Ok(await pointsService.AddBulkAttendanceAsync(User.GetUserId(), GetRole(), courseId, request, cancellationToken));
    }

    [HttpGet("attendance/sessions/{courseSessionId:guid}")]
    public async Task<ActionResult<IReadOnlyList<AttendanceSessionItemDto>>> SessionAttendance(Guid courseId, Guid courseSessionId, CancellationToken cancellationToken)
    {
        return Ok(await pointsService.GetSessionAttendanceAsync(User.GetUserId(), GetRole(), courseId, courseSessionId, cancellationToken));
    }

    [HttpPost("question")]
    [Authorize(Roles = AppRoles.Admin + "," + AppRoles.Instructor)]
    public async Task<ActionResult<PointsLogDto>> Question(Guid courseId, QuestionPointsRequest request, CancellationToken cancellationToken)
    {
        return Ok(await pointsService.AddQuestionAsync(User.GetUserId(), GetRole(), courseId, request, cancellationToken));
    }

    [HttpPost("contest")]
    [Authorize(Roles = AppRoles.Admin + "," + AppRoles.Instructor)]
    public async Task<ActionResult<PointsLogDto>> Contest(Guid courseId, ContestPointsRequest request, CancellationToken cancellationToken)
    {
        return Ok(await pointsService.AddContestAsync(User.GetUserId(), GetRole(), courseId, request, cancellationToken));
    }

    [HttpPost("manual")]
    [Authorize(Roles = AppRoles.Admin + "," + AppRoles.Instructor)]
    public async Task<ActionResult<PointsLogDto>> Manual(Guid courseId, ManualPointsRequest request, CancellationToken cancellationToken)
    {
        return Ok(await pointsService.AddManualAsync(User.GetUserId(), GetRole(), courseId, request, cancellationToken));
    }

    private string GetRole() => User.FindFirstValue(ClaimTypes.Role) ?? AppRoles.Student;
}
