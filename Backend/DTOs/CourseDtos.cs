using System.ComponentModel.DataAnnotations;

namespace CoursePoints.Api.DTOs;

public record CreateCourseRequest(
    [Required, MaxLength(160)] string Name,
    [Required, MaxLength(32)] string Code,
    [MaxLength(600)] string? Description);

public record UpdateCourseRequest(
    [Required, MaxLength(160)] string Name,
    [Required, MaxLength(32)] string Code,
    [MaxLength(600)] string? Description);

public record CreateCourseSessionRequest(
    [Required, MaxLength(160)] string Title,
    DateOnly SessionDate);

public record AssignStudentRequest([Required] Guid StudentId);
public record AssignInstructorRequest([Required] Guid InstructorId);

public record CourseDto(Guid Id, string Name, string Code, string? Description, bool IsActive, DateTimeOffset CreatedAt);

public record CourseSessionDto(Guid Id, Guid CourseId, string Title, DateOnly SessionDate);

public record CourseStudentSummaryDto(
    Guid StudentId,
    string FullName,
    string Email,
    int TotalPoints,
    int AttendanceCount,
    int AbsenceCount,
    int ExcusedAbsenceCount);

public record CourseInstructorDto(Guid Id, Guid InstructorId, string FullName, string Email, DateTimeOffset AssignedAt, bool IsActive);
