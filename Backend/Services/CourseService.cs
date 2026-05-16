using CoursePoints.Api.Data;
using CoursePoints.Api.Domain;
using CoursePoints.Api.DTOs;
using CoursePoints.Api.Entities;
using CoursePoints.Api.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace CoursePoints.Api.Services;

public class CourseService(AppDbContext dbContext) : ICourseService
{
    public async Task<CourseDto> CreateCourseAsync(Guid adminId, CreateCourseRequest request, CancellationToken cancellationToken)
    {
        var code = request.Code.Trim().ToUpperInvariant();
        if (await dbContext.Courses.AnyAsync(x => x.Code == code, cancellationToken))
        {
            throw new ApiException("A course with this code already exists.");
        }

        var course = new Course
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Code = code,
            Description = request.Description?.Trim(),
            CreatedByAdminId = adminId,
            CreatedByUserId = adminId
        };

        dbContext.Courses.Add(course);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ToCourseDto(course);
    }

    public async Task<IReadOnlyList<CourseDto>> GetCoursesAsync(Guid userId, string role, CancellationToken cancellationToken)
    {
        var query = dbContext.Courses.AsNoTracking().Where(x => x.IsActive);
        if (role == AppRoles.Student)
        {
            query = query.Where(x => x.CourseStudents.Any(cs => cs.StudentId == userId && cs.IsActive));
        }
        else if (role == AppRoles.Instructor)
        {
            query = query.Where(x => x.CreatedByUserId == userId || x.CourseInstructors.Any(ci => ci.InstructorId == userId && ci.IsActive));
        }

        return await query
            .OrderBy(x => x.Code)
            .Select(x => new CourseDto(x.Id, x.Name, x.Code, x.Description, x.IsActive, x.CreatedAt))
            .ToListAsync(cancellationToken);
    }

    public async Task<CourseDto> UpdateCourseAsync(Guid actorId, string role, Guid courseId, UpdateCourseRequest request, CancellationToken cancellationToken)
    {
        await EnsureCanManageCourseAsync(actorId, role, courseId, cancellationToken);
        var course = await dbContext.Courses.SingleAsync(x => x.Id == courseId, cancellationToken);
        var code = request.Code.Trim().ToUpperInvariant();
        if (await dbContext.Courses.AnyAsync(x => x.Id != courseId && x.Code == code, cancellationToken))
        {
            throw new ApiException("A course with this code already exists.");
        }

        course.Name = request.Name.Trim();
        course.Code = code;
        course.Description = request.Description?.Trim();
        await dbContext.SaveChangesAsync(cancellationToken);
        return ToCourseDto(course);
    }

    public async Task DeleteCourseAsync(Guid actorId, string role, Guid courseId, CancellationToken cancellationToken)
    {
        await EnsureCanManageCourseAsync(actorId, role, courseId, cancellationToken);
        var course = await dbContext.Courses.SingleAsync(x => x.Id == courseId, cancellationToken);
        course.IsActive = false;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<CourseSessionDto> CreateSessionAsync(Guid actorId, string role, Guid courseId, CreateCourseSessionRequest request, CancellationToken cancellationToken)
    {
        await EnsureCanManageCourseAsync(actorId, role, courseId, cancellationToken);

        var session = new CourseSession
        {
            Id = Guid.NewGuid(),
            CourseId = courseId,
            Title = request.Title.Trim(),
            SessionDate = request.SessionDate
        };

        dbContext.CourseSessions.Add(session);
        await dbContext.SaveChangesAsync(cancellationToken);
        return new CourseSessionDto(session.Id, session.CourseId, session.Title, session.SessionDate);
    }

    public async Task AssignStudentAsync(Guid actorId, string role, Guid courseId, AssignStudentRequest request, CancellationToken cancellationToken)
    {
        await EnsureCanManageCourseAsync(actorId, role, courseId, cancellationToken);

        var studentExists = await dbContext.Users.AnyAsync(x => x.Id == request.StudentId && x.Role == AppRoles.Student, cancellationToken);
        if (!studentExists)
        {
            throw new NotFoundException("Student was not found.");
        }

        var existing = await dbContext.CourseStudents.SingleOrDefaultAsync(
            x => x.CourseId == courseId && x.StudentId == request.StudentId,
            cancellationToken);
        if (existing is not null)
        {
            existing.IsActive = true;
            await dbContext.SaveChangesAsync(cancellationToken);
            return;
        }

        dbContext.CourseStudents.Add(new CourseStudent { CourseId = courseId, StudentId = request.StudentId });
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task RemoveStudentAsync(Guid actorId, string role, Guid courseId, Guid studentId, CancellationToken cancellationToken)
    {
        await EnsureCanManageCourseAsync(actorId, role, courseId, cancellationToken);
        var assignment = await dbContext.CourseStudents.SingleOrDefaultAsync(
            x => x.CourseId == courseId && x.StudentId == studentId && x.IsActive,
            cancellationToken) ?? throw new NotFoundException("Student assignment was not found.");
        assignment.IsActive = false;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task AssignInstructorAsync(Guid actorId, string role, Guid courseId, AssignInstructorRequest request, CancellationToken cancellationToken)
    {
        await EnsureCanManageCourseAsync(actorId, role, courseId, cancellationToken);
        var instructorExists = await dbContext.Users.AnyAsync(x => x.Id == request.InstructorId && x.Role == AppRoles.Instructor, cancellationToken);
        if (!instructorExists)
        {
            throw new NotFoundException("Instructor was not found.");
        }

        var existing = await dbContext.CourseInstructors.SingleOrDefaultAsync(
            x => x.CourseId == courseId && x.InstructorId == request.InstructorId,
            cancellationToken);
        if (existing is not null)
        {
            existing.IsActive = true;
            await dbContext.SaveChangesAsync(cancellationToken);
            return;
        }

        dbContext.CourseInstructors.Add(new CourseInstructor
        {
            Id = Guid.NewGuid(),
            CourseId = courseId,
            InstructorId = request.InstructorId
        });
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task RemoveInstructorAsync(Guid actorId, string role, Guid courseId, Guid instructorId, CancellationToken cancellationToken)
    {
        if (actorId == instructorId)
        {
            throw new ApiException("You cannot remove yourself from a course.", StatusCodes.Status400BadRequest);
        }

        await EnsureCanManageCourseAsync(actorId, role, courseId, cancellationToken);
        var assignment = await dbContext.CourseInstructors.SingleOrDefaultAsync(
            x => x.CourseId == courseId && x.InstructorId == instructorId && x.IsActive,
            cancellationToken) ?? throw new NotFoundException("Instructor assignment was not found.");
        assignment.IsActive = false;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CourseInstructorDto>> GetCourseInstructorsAsync(Guid courseId, CancellationToken cancellationToken)
    {
        await EnsureCourseExistsAsync(courseId, cancellationToken);
        return await dbContext.CourseInstructors
            .AsNoTracking()
            .Where(x => x.CourseId == courseId && x.IsActive)
            .OrderBy(x => x.Instructor!.FullName)
            .Select(x => new CourseInstructorDto(x.Id, x.InstructorId, x.Instructor!.FullName, x.Instructor.Email, x.AssignedAt, x.IsActive))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CourseStudentSummaryDto>> GetCourseStudentsAsync(Guid actorId, string role, Guid courseId, CancellationToken cancellationToken)
    {
        await EnsureCanViewCourseAsync(actorId, role, courseId, cancellationToken);

        var assignedStudents = await dbContext.CourseStudents
            .AsNoTracking()
            .Where(cs => cs.CourseId == courseId && cs.IsActive && cs.Student!.IsActive)
            .OrderBy(cs => cs.Student!.FullName)
            .Select(cs => new
            {
                cs.StudentId,
                cs.Student!.FullName,
                cs.Student.Email
            })
            .ToListAsync(cancellationToken);

        var studentIds = assignedStudents.Select(x => x.StudentId).ToList();
        if (studentIds.Count == 0)
        {
            return [];
        }

        var totals = await dbContext.PointsLogs
            .AsNoTracking()
            .Where(pl => pl.CourseId == courseId && studentIds.Contains(pl.StudentId))
            .GroupBy(pl => pl.StudentId)
            .Select(group => new { StudentId = group.Key, Total = group.Sum(pl => pl.Points) })
            .ToDictionaryAsync(x => x.StudentId, x => x.Total, cancellationToken);

        var attendanceCounts = await dbContext.PointsLogs
            .AsNoTracking()
            .Where(pl => pl.CourseId == courseId && studentIds.Contains(pl.StudentId) && pl.Type == PointLogType.Attendance)
            .GroupBy(pl => new { pl.StudentId, pl.AttendanceStatus })
            .Select(group => new { group.Key.StudentId, group.Key.AttendanceStatus, Count = group.Count() })
            .ToListAsync(cancellationToken);

        return assignedStudents
            .Select(student => new CourseStudentSummaryDto(
                student.StudentId,
                student.FullName,
                student.Email,
                totals.GetValueOrDefault(student.StudentId),
                attendanceCounts.FirstOrDefault(x => x.StudentId == student.StudentId && x.AttendanceStatus == AttendanceStatus.Present)?.Count ?? 0,
                attendanceCounts.FirstOrDefault(x => x.StudentId == student.StudentId && x.AttendanceStatus == AttendanceStatus.Absent)?.Count ?? 0,
                attendanceCounts.FirstOrDefault(x => x.StudentId == student.StudentId && x.AttendanceStatus == AttendanceStatus.Excused)?.Count ?? 0))
            .ToList();
    }

    public async Task<IReadOnlyList<StudentDto>> GetAssignableStudentsAsync(Guid actorId, string role, Guid courseId, CancellationToken cancellationToken)
    {
        await EnsureCanManageCourseAsync(actorId, role, courseId, cancellationToken);

        var assignedStudentIds = await dbContext.CourseStudents
            .AsNoTracking()
            .Where(x => x.CourseId == courseId && x.IsActive)
            .Select(x => x.StudentId)
            .ToListAsync(cancellationToken);

        var query = dbContext.Users
            .AsNoTracking()
            .Where(x => x.Role == AppRoles.Student && x.IsActive && !assignedStudentIds.Contains(x.Id));

        if (role == AppRoles.Instructor)
        {
            var courseInstructorIds = await dbContext.CourseInstructors
                .AsNoTracking()
                .Where(x => x.CourseId == courseId && x.IsActive)
                .Select(x => x.InstructorId)
                .ToListAsync(cancellationToken);

            var courseOwnerId = await dbContext.Courses
                .AsNoTracking()
                .Where(x => x.Id == courseId)
                .Select(x => x.CreatedByUserId)
                .SingleAsync(cancellationToken);

            courseInstructorIds.Add(courseOwnerId);
            courseInstructorIds.Add(actorId);
            var visibleCreatorIds = courseInstructorIds.Distinct().ToList();

            query = query.Where(x => x.CreatedByUserId.HasValue && visibleCreatorIds.Contains(x.CreatedByUserId.Value));
        }

        return await query
            .OrderBy(x => x.FullName)
            .Select(x => new StudentDto(x.Id, x.Email, x.FullName, x.MustChangePassword, x.IsActive, x.CreatedAt))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CourseSessionDto>> GetSessionsAsync(Guid actorId, string role, Guid courseId, CancellationToken cancellationToken)
    {
        await EnsureCanViewCourseAsync(actorId, role, courseId, cancellationToken);
        return await dbContext.CourseSessions
            .AsNoTracking()
            .Where(x => x.CourseId == courseId)
            .OrderByDescending(x => x.SessionDate)
            .Select(x => new CourseSessionDto(x.Id, x.CourseId, x.Title, x.SessionDate))
            .ToListAsync(cancellationToken);
    }

    public async Task EnsureCanManageCourseAsync(Guid actorId, string role, Guid courseId, CancellationToken cancellationToken)
    {
        await EnsureCourseExistsAsync(courseId, cancellationToken);
        if (role == AppRoles.Admin)
        {
            return;
        }

        if (role == AppRoles.Instructor && await dbContext.Courses.AnyAsync(
                x => x.Id == courseId && (x.CreatedByUserId == actorId || x.CourseInstructors.Any(ci => ci.InstructorId == actorId && ci.IsActive)),
                cancellationToken))
        {
            return;
        }

        throw new ApiException("You are not allowed to manage this course.", StatusCodes.Status403Forbidden);
    }

    public async Task EnsureCanViewCourseAsync(Guid actorId, string role, Guid courseId, CancellationToken cancellationToken)
    {
        await EnsureCourseExistsAsync(courseId, cancellationToken);
        if (role == AppRoles.Admin)
        {
            return;
        }

        if (role == AppRoles.Instructor && await dbContext.Courses.AnyAsync(
                x => x.Id == courseId && (x.CreatedByUserId == actorId || x.CourseInstructors.Any(ci => ci.InstructorId == actorId && ci.IsActive)),
                cancellationToken))
        {
            return;
        }

        if (role == AppRoles.Student && await dbContext.CourseStudents.AnyAsync(x => x.CourseId == courseId && x.StudentId == actorId && x.IsActive, cancellationToken))
        {
            return;
        }

        throw new ApiException("You are not allowed to access this course.", StatusCodes.Status403Forbidden);
    }

    private async Task EnsureCourseExistsAsync(Guid courseId, CancellationToken cancellationToken)
    {
        if (!await dbContext.Courses.AnyAsync(x => x.Id == courseId && x.IsActive, cancellationToken))
        {
            throw new NotFoundException("Course was not found.");
        }
    }

    private static CourseDto ToCourseDto(Course course)
    {
        return new CourseDto(course.Id, course.Name, course.Code, course.Description, course.IsActive, course.CreatedAt);
    }
}
