using System.ComponentModel.DataAnnotations;

namespace CoursePoints.Api.DTOs;

public record CreateStudentRequest(
    [Required, MaxLength(160)] string FullName,
    [Required, EmailAddress, MaxLength(256)] string Email,
    [Required, MinLength(8), MaxLength(100)] string Password,
    bool MustChangePassword = true);

public record StudentDto(Guid Id, string Email, string FullName, bool MustChangePassword, bool IsActive, DateTimeOffset CreatedAt);

public record CreateInstructorRequest(
    [Required, MaxLength(160)] string FullName,
    [Required, EmailAddress, MaxLength(256)] string Email,
    [Required, MinLength(8), MaxLength(100)] string Password,
    bool MustChangePassword = true);

public record InstructorDto(Guid Id, string Email, string FullName, bool MustChangePassword, bool IsActive, DateTimeOffset CreatedAt);

public record ResetUserPasswordRequest(
    [Required, MinLength(8), MaxLength(100)] string NewPassword,
    bool MustChangePassword = true);
