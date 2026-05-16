using CoursePoints.Api.Data;
using CoursePoints.Api.Domain;
using CoursePoints.Api.DTOs;
using CoursePoints.Api.Entities;
using CoursePoints.Api.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace CoursePoints.Api.Services;

public class AdminService(AppDbContext dbContext, IPasswordHasher passwordHasher) : IAdminService
{
    public async Task<StudentDto> CreateStudentAsync(Guid actorId, string role, CreateStudentRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var exists = await dbContext.Users.AnyAsync(x => x.Email == email, cancellationToken);
        if (exists)
        {
            throw new ApiException("A user with this email already exists.");
        }

        var student = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Email = email,
            FullName = request.FullName.Trim(),
            PasswordHash = passwordHasher.Hash(request.Password),
            Role = AppRoles.Student,
            MustChangePassword = request.MustChangePassword,
            IsActive = true,
            CreatedByUserId = actorId
        };

        dbContext.Users.Add(student);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ToStudentDto(student);
    }

    public async Task<IReadOnlyList<StudentDto>> GetStudentsAsync(Guid actorId, string role, CancellationToken cancellationToken)
    {
        var query = dbContext.Users
            .AsNoTracking()
            .Where(x => x.Role == AppRoles.Student && x.IsActive);

        if (role == AppRoles.Instructor)
        {
            query = query.Where(x =>
                x.CreatedByUserId == actorId ||
                x.CourseStudents.Any(cs => cs.IsActive &&
                    (cs.Course!.CreatedByUserId == actorId ||
                     cs.Course.CourseInstructors.Any(ci => ci.InstructorId == actorId && ci.IsActive))));
        }

        return await query
            .OrderBy(x => x.FullName)
            .Select(x => new StudentDto(x.Id, x.Email, x.FullName, x.MustChangePassword, x.IsActive, x.CreatedAt))
            .ToListAsync(cancellationToken);
    }

    public async Task DeleteStudentAsync(Guid actorId, string role, Guid studentId, CancellationToken cancellationToken)
    {
        var student = await dbContext.Users.SingleOrDefaultAsync(x => x.Id == studentId && x.Role == AppRoles.Student, cancellationToken)
            ?? throw new NotFoundException("Student was not found.");
        if (role == AppRoles.Instructor)
        {
            var belongsToOwnedCourse = await dbContext.CourseStudents.AnyAsync(
                cs => cs.StudentId == studentId && cs.IsActive && cs.Course!.CreatedByUserId == actorId,
                cancellationToken);
            if (!belongsToOwnedCourse)
            {
                throw new ApiException("You can delete only students assigned to your own courses.", StatusCodes.Status403Forbidden);
            }
        }

        student.IsActive = false;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<InstructorDto> CreateInstructorAsync(Guid actorId, string role, CreateInstructorRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (await dbContext.Users.AnyAsync(x => x.Email == email, cancellationToken))
        {
            throw new ApiException("A user with this email already exists.");
        }

        var instructor = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Email = email,
            FullName = request.FullName.Trim(),
            PasswordHash = passwordHasher.Hash(request.Password),
            Role = AppRoles.Instructor,
            MustChangePassword = request.MustChangePassword,
            IsActive = true,
            CreatedByUserId = actorId
        };

        dbContext.Users.Add(instructor);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ToInstructorDto(instructor);
    }

    public async Task<IReadOnlyList<InstructorDto>> GetInstructorsAsync(Guid actorId, string role, CancellationToken cancellationToken)
    {
        var query = dbContext.Users
            .AsNoTracking()
            .Where(x => x.Role == AppRoles.Instructor && x.IsActive);

        if (role == AppRoles.Instructor)
        {
            query = query.Where(x =>
                x.Id == actorId ||
                x.CreatedByUserId == actorId ||
                x.CourseInstructors.Any(ci => ci.IsActive &&
                    (ci.Course!.CreatedByUserId == actorId ||
                     ci.Course.CourseInstructors.Any(peer => peer.InstructorId == actorId && peer.IsActive))));
        }

        return await query
            .OrderBy(x => x.FullName)
            .Select(x => new InstructorDto(x.Id, x.Email, x.FullName, x.MustChangePassword, x.IsActive, x.CreatedAt))
            .ToListAsync(cancellationToken);
    }

    public async Task DeleteInstructorAsync(Guid actorId, string role, Guid instructorId, CancellationToken cancellationToken)
    {
        if (actorId == instructorId)
        {
            throw new ApiException("You cannot delete your own account.", StatusCodes.Status400BadRequest);
        }

        var instructor = await dbContext.Users.SingleOrDefaultAsync(x => x.Id == instructorId && x.Role == AppRoles.Instructor, cancellationToken)
            ?? throw new NotFoundException("Instructor was not found.");
        if (role == AppRoles.Instructor)
        {
            var assignedToOwnedCourse = await dbContext.CourseInstructors.AnyAsync(
                ci => ci.InstructorId == instructorId && ci.IsActive && ci.Course!.CreatedByUserId == actorId,
                cancellationToken);
            if (!assignedToOwnedCourse)
            {
                throw new ApiException("You can delete only instructors assigned to your own courses.", StatusCodes.Status403Forbidden);
            }
        }

        instructor.IsActive = false;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task ResetUserPasswordAsync(Guid userId, ResetUserPasswordRequest request, CancellationToken cancellationToken)
    {
        var user = await dbContext.Users.SingleOrDefaultAsync(x => x.Id == userId && x.IsActive, cancellationToken)
            ?? throw new NotFoundException("User was not found.");

        user.PasswordHash = passwordHasher.Hash(request.NewPassword);
        user.MustChangePassword = request.MustChangePassword;

        var activeRefreshTokens = await dbContext.RefreshTokens
            .Where(x => x.UserId == userId && x.RevokedAt == null)
            .ToListAsync(cancellationToken);
        foreach (var token in activeRefreshTokens)
        {
            token.RevokedAt = DateTimeOffset.UtcNow;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static StudentDto ToStudentDto(ApplicationUser student)
    {
        return new StudentDto(student.Id, student.Email, student.FullName, student.MustChangePassword, student.IsActive, student.CreatedAt);
    }

    private static InstructorDto ToInstructorDto(ApplicationUser instructor)
    {
        return new InstructorDto(instructor.Id, instructor.Email, instructor.FullName, instructor.MustChangePassword, instructor.IsActive, instructor.CreatedAt);
    }
}
