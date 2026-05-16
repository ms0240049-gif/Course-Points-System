using CoursePoints.Api.DTOs;

namespace CoursePoints.Api.Services;

public interface ICourseService
{
    Task<CourseDto> CreateCourseAsync(Guid adminId, CreateCourseRequest request, CancellationToken cancellationToken);
    Task<CourseDto> UpdateCourseAsync(Guid actorId, string role, Guid courseId, UpdateCourseRequest request, CancellationToken cancellationToken);
    Task DeleteCourseAsync(Guid actorId, string role, Guid courseId, CancellationToken cancellationToken);
    Task<IReadOnlyList<CourseDto>> GetCoursesAsync(Guid userId, string role, CancellationToken cancellationToken);
    Task<CourseSessionDto> CreateSessionAsync(Guid actorId, string role, Guid courseId, CreateCourseSessionRequest request, CancellationToken cancellationToken);
    Task AssignStudentAsync(Guid actorId, string role, Guid courseId, AssignStudentRequest request, CancellationToken cancellationToken);
    Task RemoveStudentAsync(Guid actorId, string role, Guid courseId, Guid studentId, CancellationToken cancellationToken);
    Task AssignInstructorAsync(Guid actorId, string role, Guid courseId, AssignInstructorRequest request, CancellationToken cancellationToken);
    Task RemoveInstructorAsync(Guid actorId, string role, Guid courseId, Guid instructorId, CancellationToken cancellationToken);
    Task<IReadOnlyList<CourseInstructorDto>> GetCourseInstructorsAsync(Guid courseId, CancellationToken cancellationToken);
    Task<IReadOnlyList<CourseStudentSummaryDto>> GetCourseStudentsAsync(Guid actorId, string role, Guid courseId, CancellationToken cancellationToken);
    Task<IReadOnlyList<StudentDto>> GetAssignableStudentsAsync(Guid actorId, string role, Guid courseId, CancellationToken cancellationToken);
    Task<IReadOnlyList<CourseSessionDto>> GetSessionsAsync(Guid actorId, string role, Guid courseId, CancellationToken cancellationToken);
    Task EnsureCanManageCourseAsync(Guid actorId, string role, Guid courseId, CancellationToken cancellationToken);
    Task EnsureCanViewCourseAsync(Guid actorId, string role, Guid courseId, CancellationToken cancellationToken);
}
