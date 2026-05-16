namespace CoursePoints.Api.Entities;

public class CourseStudent
{
    public Guid CourseId { get; set; }
    public Course? Course { get; set; }
    public Guid StudentId { get; set; }
    public ApplicationUser? Student { get; set; }
    public DateTimeOffset AssignedAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsActive { get; set; } = true;
}
