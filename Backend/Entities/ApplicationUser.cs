using CoursePoints.Api.Domain;

namespace CoursePoints.Api.Entities;

public class ApplicationUser
{
    public Guid Id { get; set; }
    public required string Email { get; set; }
    public required string FullName { get; set; }
    public required string PasswordHash { get; set; }
    public required string Role { get; set; } = AppRoles.Student;
    public bool MustChangePassword { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public Guid? CreatedByUserId { get; set; }
    public ApplicationUser? CreatedByUser { get; set; }

    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];
    public ICollection<CourseStudent> CourseStudents { get; set; } = [];
    public ICollection<CourseInstructor> CourseInstructors { get; set; } = [];
    public ICollection<Course> CreatedCourses { get; set; } = [];
}
