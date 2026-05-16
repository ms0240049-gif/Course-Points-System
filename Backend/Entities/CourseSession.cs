namespace CoursePoints.Api.Entities;

public class CourseSession
{
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public DateOnly SessionDate { get; set; }
    public Guid CourseId { get; set; }
    public Course? Course { get; set; }
    public ICollection<PointsLog> PointsLogs { get; set; } = [];
}
