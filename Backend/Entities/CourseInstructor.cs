namespace CoursePoints.Api.Entities;

public class CourseInstructor
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public Course? Course { get; set; }
    public Guid InstructorId { get; set; }
    public ApplicationUser? Instructor { get; set; }
    public DateTimeOffset AssignedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsActive { get; set; } = true;
}
