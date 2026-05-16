using CoursePoints.Api.Data;
using CoursePoints.Api.Domain;
using CoursePoints.Api.DTOs;
using CoursePoints.Api.Entities;
using CoursePoints.Api.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace CoursePoints.Api.Services;

public class PointsService(AppDbContext dbContext, ICourseService courseService) : IPointsService
{
    public async Task<PointsLogDto> AddAttendanceAsync(Guid actorId, string role, Guid courseId, AttendancePointsRequest request, CancellationToken cancellationToken)
    {
        await courseService.EnsureCanManageCourseAsync(actorId, role, courseId, cancellationToken);
        var points = request.IsPresent ? PointRules.AttendancePresent : PointRules.AttendanceAbsent;
        var reason = request.IsPresent ? "Attendance: present" : "Attendance: absent";
        var status = request.IsPresent ? AttendanceStatus.Present : AttendanceStatus.Absent;
        return await AddPointsAsync(actorId, courseId, request.StudentId, request.CourseSessionId, PointLogType.Attendance, status, points, reason, true, cancellationToken);
    }

    public async Task<BulkAttendanceSummaryDto> AddBulkAttendanceAsync(Guid actorId, string role, Guid courseId, BulkAttendanceRequest request, CancellationToken cancellationToken)
    {
        await courseService.EnsureCanManageCourseAsync(actorId, role, courseId, cancellationToken);
        var sessionExists = await dbContext.CourseSessions.AnyAsync(x => x.Id == request.CourseSessionId && x.CourseId == courseId, cancellationToken);
        if (!sessionExists)
        {
            throw new NotFoundException("Course session was not found for this course.");
        }

        var studentIds = request.Items.Select(x => x.StudentId).Distinct().ToList();
        if (studentIds.Count != request.Items.Count)
        {
            throw new ApiException("Bulk attendance contains duplicate students.");
        }

        var assignedStudentIds = await dbContext.CourseStudents
            .Where(x => x.CourseId == courseId && x.IsActive && studentIds.Contains(x.StudentId))
            .Select(x => x.StudentId)
            .ToListAsync(cancellationToken);
        if (assignedStudentIds.Count != studentIds.Count)
        {
            throw new ApiException("All attendance students must be assigned to this course.");
        }

        var existing = await dbContext.PointsLogs
            .Where(x => x.CourseId == courseId && x.CourseSessionId == request.CourseSessionId && x.Type == PointLogType.Attendance && studentIds.Contains(x.StudentId))
            .ToDictionaryAsync(x => x.StudentId, cancellationToken);

        var totalPoints = 0;
        foreach (var item in request.Items)
        {
            var points = item.Status == AttendanceStatus.Present ? PointRules.AttendancePresent : 0;
            var reason = item.Status switch
            {
                AttendanceStatus.Present => "Attendance: present",
                AttendanceStatus.Absent => "Attendance: absent",
                AttendanceStatus.Excused => string.IsNullOrWhiteSpace(item.Reason)
                    ? "Attendance: excused"
                    : $"Attendance: excused - {item.Reason.Trim()}",
                _ => throw new ApiException("Invalid attendance status.")
            };

            if (existing.TryGetValue(item.StudentId, out var existingLog))
            {
                totalPoints += points - existingLog.Points;
                existingLog.Points = points;
                existingLog.Reason = reason;
                existingLog.AttendanceStatus = item.Status;
                existingLog.CreatedByAdminId = actorId;
                continue;
            }

            dbContext.PointsLogs.Add(new PointsLog
            {
                Id = Guid.NewGuid(),
                StudentId = item.StudentId,
                CourseId = courseId,
                CourseSessionId = request.CourseSessionId,
                Type = PointLogType.Attendance,
                AttendanceStatus = item.Status,
                Points = points,
                Reason = reason,
                CreatedByAdminId = actorId
            });
            totalPoints += points;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return new BulkAttendanceSummaryDto(
            request.Items.Count,
            request.Items.Count(x => x.Status == AttendanceStatus.Present),
            request.Items.Count(x => x.Status == AttendanceStatus.Absent),
            request.Items.Count(x => x.Status == AttendanceStatus.Excused),
            totalPoints);
    }

    public async Task<IReadOnlyList<AttendanceSessionItemDto>> GetSessionAttendanceAsync(Guid actorId, string role, Guid courseId, Guid courseSessionId, CancellationToken cancellationToken)
    {
        await courseService.EnsureCanViewCourseAsync(actorId, role, courseId, cancellationToken);
        var sessionExists = await dbContext.CourseSessions.AnyAsync(x => x.Id == courseSessionId && x.CourseId == courseId, cancellationToken);
        if (!sessionExists)
        {
            throw new NotFoundException("Course session was not found for this course.");
        }

        return await dbContext.PointsLogs
            .AsNoTracking()
            .Where(x => x.CourseId == courseId && x.CourseSessionId == courseSessionId && x.Type == PointLogType.Attendance && x.AttendanceStatus.HasValue)
            .Select(x => new AttendanceSessionItemDto(x.StudentId, x.AttendanceStatus!.Value, x.Reason))
            .ToListAsync(cancellationToken);
    }

    public async Task<PointsLogDto> AddQuestionAsync(Guid actorId, string role, Guid courseId, QuestionPointsRequest request, CancellationToken cancellationToken)
    {
        await courseService.EnsureCanManageCourseAsync(actorId, role, courseId, cancellationToken);
        var points = request.Result switch
        {
            QuestionResult.Correct => PointRules.QuestionCorrect,
            QuestionResult.Close => PointRules.QuestionClose,
            QuestionResult.None => PointRules.QuestionNone,
            _ => throw new ApiException("Invalid question result.")
        };

        return await AddPointsAsync(actorId, courseId, request.StudentId, request.CourseSessionId, PointLogType.SessionQuestion, null, points, $"Session question: {request.Result}", false, cancellationToken);
    }

    public async Task<PointsLogDto> AddContestAsync(Guid actorId, string role, Guid courseId, ContestPointsRequest request, CancellationToken cancellationToken)
    {
        await courseService.EnsureCanManageCourseAsync(actorId, role, courseId, cancellationToken);
        var points = request.Rank switch
        {
            1 => PointRules.ContestRankOne,
            2 => PointRules.ContestRankTwo,
            3 => PointRules.ContestRankThree,
            null => PointRules.ContestParticipant,
            _ => PointRules.ContestParticipant
        };
        var reason = request.Rank is null ? "Mini contest: participant" : $"Mini contest: rank {request.Rank}";
        return await AddPointsAsync(actorId, courseId, request.StudentId, null, PointLogType.MiniContest, null, points, reason, false, cancellationToken);
    }

    public async Task<PointsLogDto> AddManualAsync(Guid actorId, string role, Guid courseId, ManualPointsRequest request, CancellationToken cancellationToken)
    {
        await courseService.EnsureCanManageCourseAsync(actorId, role, courseId, cancellationToken);
        return await AddPointsAsync(actorId, courseId, request.StudentId, null, PointLogType.ManualAdjustment, null, request.Points, request.Reason.Trim(), false, cancellationToken);
    }

    public async Task<IReadOnlyList<LeaderboardEntryDto>> GetLeaderboardAsync(Guid actorId, string role, Guid courseId, CancellationToken cancellationToken)
{
    await courseService.EnsureCanViewCourseAsync(actorId, role, courseId, cancellationToken);


    var students = await dbContext.CourseStudents
        .AsNoTracking()
            .Where(cs => cs.CourseId == courseId && cs.IsActive)
        .Select(cs => new
        {
            cs.StudentId,
            cs.Student!.FullName,
            cs.Student.Email
        })
        .ToListAsync(cancellationToken);

    var leaderboard = students
        .Select(s => new LeaderboardEntryDto(
            s.StudentId,
            s.FullName,
            s.Email,
            dbContext.PointsLogs
                .Where(pl => pl.CourseId == courseId && pl.StudentId == s.StudentId)
                .Sum(pl => (int?)pl.Points) ?? 0
        ))
        .OrderByDescending(x => x.TotalPoints)
        .ThenBy(x => x.StudentName)
        .ToList();

    return leaderboard;
}

    public async Task<IReadOnlyList<PointsLogDto>> GetStudentPointsAsync(Guid actorId, string role, Guid courseId, Guid studentId, CancellationToken cancellationToken)
    {
        await courseService.EnsureCanViewCourseAsync(actorId, role, courseId, cancellationToken);
        if (role == AppRoles.Student && actorId != studentId)
        {
            throw new ApiException("Students can only view their own points.", StatusCodes.Status403Forbidden);
        }
        await EnsureStudentAssignedAsync(courseId, studentId, cancellationToken);

        return await dbContext.PointsLogs
            .AsNoTracking()
            .Where(x => x.CourseId == courseId && x.StudentId == studentId)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new PointsLogDto(
                x.Id,
                x.StudentId,
                x.Student!.FullName,
                x.CourseId,
                x.CourseSessionId,
                x.Type,
                x.AttendanceStatus,
                x.Points,
                x.Reason,
                x.CreatedAt))
            .ToListAsync(cancellationToken);
    }

    private async Task<PointsLogDto> AddPointsAsync(
        Guid adminId,
        Guid courseId,
        Guid studentId,
        Guid? sessionId,
        PointLogType type,
        AttendanceStatus? attendanceStatus,
        int points,
        string reason,
        bool preventDuplicateAttendance,
        CancellationToken cancellationToken)
    {
        await EnsureStudentAssignedAsync(courseId, studentId, cancellationToken);
        if (sessionId.HasValue)
        {
            var sessionExists = await dbContext.CourseSessions.AnyAsync(
                x => x.Id == sessionId.Value && x.CourseId == courseId,
                cancellationToken);
            if (!sessionExists)
            {
                throw new NotFoundException("Course session was not found for this course.");
            }
        }

        if (preventDuplicateAttendance && sessionId.HasValue && await dbContext.PointsLogs.AnyAsync(
                x => x.CourseId == courseId && x.StudentId == studentId && x.CourseSessionId == sessionId && x.Type == PointLogType.Attendance,
                cancellationToken))
        {
            throw new ApiException("Attendance already exists for this student and session.");
        }

        var log = new PointsLog
        {
            Id = Guid.NewGuid(),
            StudentId = studentId,
            CourseId = courseId,
            CourseSessionId = sessionId,
            Type = type,
            AttendanceStatus = attendanceStatus,
            Points = points,
            Reason = reason,
            CreatedByAdminId = adminId
        };

        dbContext.PointsLogs.Add(log);
        await dbContext.SaveChangesAsync(cancellationToken);

        return await dbContext.PointsLogs
            .AsNoTracking()
            .Where(x => x.Id == log.Id)
            .Select(x => new PointsLogDto(
                x.Id,
                x.StudentId,
                x.Student!.FullName,
                x.CourseId,
                x.CourseSessionId,
                x.Type,
                x.AttendanceStatus,
                x.Points,
                x.Reason,
                x.CreatedAt))
            .SingleAsync(cancellationToken);
    }

    private async Task EnsureCourseExistsAsync(Guid courseId, CancellationToken cancellationToken)
    {
        if (!await dbContext.Courses.AnyAsync(x => x.Id == courseId, cancellationToken))
        {
            throw new NotFoundException("Course was not found.");
        }
    }

    private async Task EnsureStudentAssignedAsync(Guid courseId, Guid studentId, CancellationToken cancellationToken)
    {
        var assigned = await dbContext.CourseStudents.AnyAsync(
            x => x.CourseId == courseId && x.StudentId == studentId && x.IsActive && x.Student!.Role == AppRoles.Student,
            cancellationToken);
        if (!assigned)
        {
            throw new ApiException("Student is not assigned to this course.", StatusCodes.Status400BadRequest);
        }
    }
}
