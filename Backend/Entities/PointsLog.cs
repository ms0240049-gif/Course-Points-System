using CoursePoints.Api.Domain;

namespace CoursePoints.Api.Entities;

public class PointsLog
{
    public Guid Id { get; set; }
    public Guid StudentId { get; set; }
    public ApplicationUser? Student { get; set; }
    public Guid CourseId { get; set; }
    public Course? Course { get; set; }
    public Guid? CourseSessionId { get; set; }
    public CourseSession? CourseSession { get; set; }
    public PointLogType Type { get; set; }
    public AttendanceStatus? AttendanceStatus { get; set; }
    public int Points { get; set; }
    public required string Reason { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public Guid CreatedByAdminId { get; set; }
    public ApplicationUser? CreatedByAdmin { get; set; }
}
