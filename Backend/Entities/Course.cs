namespace CoursePoints.Api.Entities;

public class Course
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Code { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public Guid CreatedByAdminId { get; set; }
    public ApplicationUser? CreatedByAdmin { get; set; }
    public Guid CreatedByUserId { get; set; }
    public ApplicationUser? CreatedByUser { get; set; }

    public ICollection<CourseStudent> CourseStudents { get; set; } = [];
    public ICollection<CourseInstructor> CourseInstructors { get; set; } = [];
    public ICollection<CourseSession> Sessions { get; set; } = [];
    public ICollection<PointsLog> PointsLogs { get; set; } = [];
}
