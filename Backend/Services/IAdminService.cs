using CoursePoints.Api.DTOs;

namespace CoursePoints.Api.Services;

public interface IAdminService
{
    Task<StudentDto> CreateStudentAsync(Guid actorId, string role, CreateStudentRequest request, CancellationToken cancellationToken);
    Task<IReadOnlyList<StudentDto>> GetStudentsAsync(Guid actorId, string role, CancellationToken cancellationToken);
    Task DeleteStudentAsync(Guid actorId, string role, Guid studentId, CancellationToken cancellationToken);
    Task<InstructorDto> CreateInstructorAsync(Guid actorId, string role, CreateInstructorRequest request, CancellationToken cancellationToken);
    Task<IReadOnlyList<InstructorDto>> GetInstructorsAsync(Guid actorId, string role, CancellationToken cancellationToken);
    Task DeleteInstructorAsync(Guid actorId, string role, Guid instructorId, CancellationToken cancellationToken);
    Task ResetUserPasswordAsync(Guid userId, ResetUserPasswordRequest request, CancellationToken cancellationToken);
}
