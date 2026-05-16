using CoursePoints.Api.DTOs;

namespace CoursePoints.Api.Services;

public interface IPointsService
{
    Task<PointsLogDto> AddAttendanceAsync(Guid actorId, string role, Guid courseId, AttendancePointsRequest request, CancellationToken cancellationToken);
    Task<BulkAttendanceSummaryDto> AddBulkAttendanceAsync(Guid actorId, string role, Guid courseId, BulkAttendanceRequest request, CancellationToken cancellationToken);
    Task<IReadOnlyList<AttendanceSessionItemDto>> GetSessionAttendanceAsync(Guid actorId, string role, Guid courseId, Guid courseSessionId, CancellationToken cancellationToken);
    Task<PointsLogDto> AddQuestionAsync(Guid actorId, string role, Guid courseId, QuestionPointsRequest request, CancellationToken cancellationToken);
    Task<PointsLogDto> AddContestAsync(Guid actorId, string role, Guid courseId, ContestPointsRequest request, CancellationToken cancellationToken);
    Task<PointsLogDto> AddManualAsync(Guid actorId, string role, Guid courseId, ManualPointsRequest request, CancellationToken cancellationToken);
    Task<IReadOnlyList<LeaderboardEntryDto>> GetLeaderboardAsync(Guid actorId, string role, Guid courseId, CancellationToken cancellationToken);
    Task<IReadOnlyList<PointsLogDto>> GetStudentPointsAsync(Guid actorId, string role, Guid courseId, Guid studentId, CancellationToken cancellationToken);
}
